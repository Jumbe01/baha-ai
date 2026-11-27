/* ============================================================
 *  BahaAI — combined node: sensors + relays + floodgate servo
 *
 *  Every POST_INTERVAL_MS  reads water level, DHT22 and the rain plate
 *                          and POSTs them to /api/sensors/{id}/readings
 *  Every POLL_INTERVAL_MS  reads GET /api/actuators?zone=ZONE_ID and
 *                          switches the relays / swings the servo
 *
 *  secrets.h (git-ignored) holds Wi-Fi, sensor ID and device token.
 *  Never commit or share it. The server is SERVER_URL below (HTTPS).
 *d:\Coding\Projects\baha-ai\firmware\gate7_relay\gate7_relay.ino
 *  WIRING (breadboard: LEFT rails 5V from charger, RIGHT rails ESP32 3V3)
 *    HC-SR04  Vcc LEFT+  Gnd LEFT-  Trig P17  Echo e5 -> divider -> P16 (e10)
 *    DHT22    + 3V3      - GND      out P32
 *    Rain plate  one pin RIGHT+, other pin P33
 *    Relay    VCC LEFT+  GND LEFT-  IN1 P26 pump  IN2 P27 siren
 *             IN3 P14 floodgate  IN4 P13 spare
 *    Servo    brown LEFT-  red LEFT+  orange P25
 *  Libraries: DHT sensor library (Adafruit), ArduinoJson 7, ESP32Servo.
 * ============================================================ */

#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <ESP32Servo.h>
#include "driver/rtc_io.h"
#include "secrets.h"
#include "root_ca.h"

/* ---------- EDIT THIS BLOCK ---------- */
const char* SERVER_URL = "https://baha-ai.tech";       // the VPS (HTTPS via Caddy)
const float MOUNT_HEIGHT_M = 0.62;                     // probe face -> tank bottom, measure it
const unsigned long POST_INTERVAL_MS = 15UL * 1000UL;  // set 5UL*60UL*1000UL before the demo
const unsigned long POLL_INTERVAL_MS = 5UL * 1000UL;
const int ZONE_ID = 227;                               // "Test Tank (Demo)" zone (check /actuation if the DB is reseeded)
const int RAIN_WET_MV = 300;                           // tune: plate reading above this = raining
const int GATE_CLOSED_DEG = 0;                         // tune once the arm is on the gate
const int GATE_OPEN_DEG   = 90;
/* ------------------------------------- */

#define PIN_TRIG     17
#define PIN_ECHO     16
#define PIN_DHT      32   // was 4; moved for the two-breadboard layout
#define PIN_RAIN     33
#define PIN_SERVO    25
#define RELAY_PUMP   26
#define RELAY_SIREN  27
#define RELAY_GATE   14
#define RELAY_SPARE  13
#define RELAY_ACTIVE_LOW true

const int   SAMPLE_COUNT = 5;
const int   MAX_PINGS    = 20;
const float SENSOR_MIN_M = 0.25;
const float SENSOR_MAX_M = 4.50;

DHT dht(PIN_DHT, DHT22);
Servo gate;
WiFiClientSecure tls;   // verifies baha-ai.tech against ROOT_CA
int gateDeg = GATE_CLOSED_DEG;
unsigned long lastPost = 0, lastPoll = 0;
bool firstRun = true;

void setRelay(int pin, bool on) {
  digitalWrite(pin, (on == RELAY_ACTIVE_LOW) ? LOW : HIGH);
}

// 1 degree per 15 ms: a full-speed jump draws ~0.7 A and can brown things out.
void moveGate(int target) {
  while (gateDeg != target) {
    gateDeg += (target > gateDeg) ? 1 : -1;
    gate.write(gateDeg);
    delay(15);
  }
}

void connectWifi() {
  if (WiFi.status() == WL_CONNECTED) return;
  static bool begun = false;              // begin once; the ESP32 keeps retrying by itself
  if (!begun) {
    WiFi.mode(WIFI_STA);
    WiFi.setTxPower(WIFI_POWER_8_5dBm);   // smaller start-up spike, fewer brownouts
    WiFi.setAutoReconnect(true);
    WiFi.begin(SECRET_WIFI_SSID, SECRET_WIFI_PASSWORD);
    begun = true;
  }
  Serial.print("Wi-Fi connecting");
  unsigned long started = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - started < 20000UL) {
    delay(400);
    Serial.print(".");
  }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("Connected, IP ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("Wi-Fi failed — will retry next cycle");
  }
}

void setup() {
  Serial.begin(115200);
  delay(200);

  int relays[] = { RELAY_PUMP, RELAY_SIREN, RELAY_GATE, RELAY_SPARE };
  for (int pin : relays) {
    pinMode(pin, OUTPUT);              // must come before digitalWrite on core 3.x
    setRelay(pin, false);
  }

  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  digitalWrite(PIN_TRIG, LOW);
  dht.begin();

  // The bare rain plate only connects P33 to 3V3 when wet, so the pin needs a
  // pull-down to read 0 when dry. Configure the ADC first, then enable the
  // internal (RTC) pull-down on that pad.
  analogReadMilliVolts(PIN_RAIN);
  rtc_gpio_pullup_dis((gpio_num_t)PIN_RAIN);
  rtc_gpio_pulldown_en((gpio_num_t)PIN_RAIN);

  gate.attach(PIN_SERVO);
  gate.write(GATE_CLOSED_DEG);
  tls.setCACert(ROOT_CA);

  Serial.println("\n=== BahaAI node: sensors + actuators ===");
  connectWifi();
}

/* ---------- sensors ---------- */

float readDistanceOnce(float tempC) {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(4);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(20);
  digitalWrite(PIN_TRIG, LOW);
  unsigned long duration = pulseIn(PIN_ECHO, HIGH, 30000UL);
  if (duration == 0) return -1.0;
  float speed  = 331.3 + 0.606 * tempC;
  float metres = (duration * 1e-6 * speed) / 2.0;
  if (metres < SENSOR_MIN_M || metres > SENSOR_MAX_M) return -1.0;
  return metres;
}

// Median of up to 5 good pings out of 20 tries; rejects ripple outliers.
float readDistanceMedian(float tempC) {
  float samples[SAMPLE_COUNT];
  int valid = 0, tries = 0;
  while (valid < SAMPLE_COUNT && tries < MAX_PINGS) {
    float d = readDistanceOnce(tempC);
    tries++;
    if (d > 0) samples[valid++] = d;
    delay(100);
  }
  if (valid < 3) return -1.0;
  for (int i = 1; i < valid; i++) {
    float key = samples[i];
    int j = i - 1;
    while (j >= 0 && samples[j] > key) { samples[j + 1] = samples[j]; j--; }
    samples[j + 1] = key;
  }
  return samples[valid / 2];
}

// 0 % dry .. 100 % plate fully bridged (3.3 V).
// ponytail: wetness %, not mm of rain — the bare plate can't measure volume.
float readRainPercent() {
  uint32_t total = 0;
  for (int i = 0; i < 8; i++) total += analogReadMilliVolts(PIN_RAIN);
  int mv = total / 8;
  if (mv < RAIN_WET_MV) return 0.0;
  return constrain(mv / 3300.0f * 100.0f, 0.0f, 100.0f);
}

void postSensors() {
  float tempC    = dht.readTemperature();
  float humidity = dht.readHumidity();
  float distance = readDistanceMedian(isnan(tempC) ? 26.0 : tempC);
  float rain     = readRainPercent();

  if (distance < 0) {
    Serial.println("No usable echo — skipping this reading");
    return;
  }
  float level = max(0.0f, MOUNT_HEIGHT_M - distance);

  Serial.printf("distance %.3f m | level %.3f m | %.1f C | %.1f %% | rain %.0f %%\n",
                distance, level, tempC, humidity, rain);

  String body = "{\"water_level\":" + String(level, 3)
              + ",\"rainfall\":" + String(rain, 1);
  if (!isnan(tempC))    body += ",\"temperature\":" + String(tempC, 2);
  if (!isnan(humidity)) body += ",\"humidity\":" + String(humidity, 2);
  body += "}";

  HTTPClient http;
  http.begin(tls, String(SERVER_URL) + "/api/sensors/" + String(SECRET_SENSOR_ID) + "/readings");
  http.setTimeout(10000);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Accept", "application/json");
  http.addHeader("Authorization", String("Bearer ") + SECRET_DEVICE_TOKEN);
  int code = http.POST(body);
  Serial.printf("POST -> HTTP %d\n", code);
  if (code == 422) Serial.println(http.getString());
  if (code < 0)    Serial.println("  Server unreachable — check internet on this Wi-Fi and that baha-ai.tech is up");
  http.end();
}

/* ---------- actuators ---------- */

void pollActuators() {
  HTTPClient http;
  http.begin(tls, String(SERVER_URL) + "/api/actuators?zone=" + String(ZONE_ID));
  http.setTimeout(10000);
  http.addHeader("Accept", "application/json");
  int code = http.GET();
  if (code != 200) {
    // Keep the last state: a Wi-Fi blip must not stop a pump mid-flood.
    Serial.printf("actuator poll -> HTTP %d (keeping last state)\n", code);
    http.end();
    return;
  }
  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, http.getString());
  http.end();
  if (err) { Serial.println("actuator JSON parse failed"); return; }

  for (JsonObject device : doc["devices"].as<JsonArray>()) {
    const char* type = device["type"];
    bool on = device["is_on"];
    if (strcmp(type, "pump") == 0) {
      setRelay(RELAY_PUMP, on);
    } else if (strcmp(type, "siren") == 0) {
      setRelay(RELAY_SIREN, on);
    } else if (strcmp(type, "floodgate") == 0 || strcmp(type, "valve") == 0) {
      setRelay(RELAY_GATE, on);
      moveGate(on ? GATE_OPEN_DEG : GATE_CLOSED_DEG);   // no-op if already there
    }
  }
}

void loop() {
  unsigned long now = millis();
  bool postDue = firstRun || now - lastPost >= POST_INTERVAL_MS;
  bool pollDue = firstRun || now - lastPoll >= POLL_INTERVAL_MS;
  if (!postDue && !pollDue) return;
  firstRun = false;

  connectWifi();
  if (WiFi.status() != WL_CONNECTED) return;

  if (pollDue) { lastPoll = now; pollActuators(); }
  if (postDue) { lastPost = now; postSensors(); }
}
