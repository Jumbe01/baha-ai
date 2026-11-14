/* ============================================================
 *  BahaAI — Flood Sensor Node
 *  ESP32 + JSN-SR04T / AJ-SR04M ultrasonic + DHT22
 *
 *  Posts to  POST /api/sensors/{id}/readings
 *  Sends     water_level (m), temperature (C), humidity (%),
 *            battery_level (%) once REPORT_BATTERY is true
 *
 *  Wi-Fi, server address, sensor ID and device token come from
 *  secrets.h next to this file. It is git-ignored — never commit
 *  or share it.
 *
 *  WIRING
 *    Ultrasonic 5V        -> ESP32 5V (via breadboard + rail)
 *    Ultrasonic RX / Trig -> GPIO 17
 *    Ultrasonic TX / Echo -> 1k -> junction -> GPIO 16
 *                            junction -> 1k -> 1k -> GND
 *    DHT22 +   -> 3V3     DHT22 out -> GPIO 4     DHT22 - -> GND
 *    470 uF capacitor across the + and - rails (stripe to -)
 * ============================================================ */

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include "secrets.h"

/* ---------- EDIT THIS BLOCK ---------- */

// Vertical distance from the probe face down to the tank bottom, in metres.
// Measure it with a tape measure — do not estimate it.
const float MOUNT_HEIGHT_M = 0.62;

// 15 s while testing. Set back to 5UL * 60UL * 1000UL before the demo:
// 15 s floods the charts with 240 readings an hour.
const unsigned long POST_INTERVAL_MS = 15UL * 1000UL;

const bool REPORT_BATTERY = false;            // true once the battery is wired

/* ------------------------------------- */

#define PIN_TRIG     17
#define PIN_ECHO     16
#define PIN_DHT       4
#define PIN_LED       2
#define PIN_BATTERY  34

DHT dht(PIN_DHT, DHT22);

const int   SAMPLE_COUNT = 5;      // good pings wanted for the median
const int   MAX_PINGS    = 20;     // give up after this many tries
const float SENSOR_MIN_M = 0.25;   // JSN-SR04T blind zone
const float SENSOR_MAX_M = 4.50;
const float BATT_EMPTY_V = 3.00;
const float BATT_FULL_V  = 4.20;

unsigned long lastPost = 0;
bool firstRun = true;

void setup() {
  Serial.begin(115200);
  delay(200);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  pinMode(PIN_LED, OUTPUT);
  digitalWrite(PIN_TRIG, LOW);
  dht.begin();
  Serial.println();
  Serial.println("=== BahaAI sensor node ===");
  connectWifi();
}

void connectWifi() {
  if (WiFi.status() == WL_CONNECTED) return;
  WiFi.mode(WIFI_STA);
  // Lower radio power: cuts the connect current spike that tripped the
  // brownout detector on USB power. Raise it if the router is far away.
  WiFi.setTxPower(WIFI_POWER_8_5dBm);
  WiFi.begin(SECRET_WIFI_SSID, SECRET_WIFI_PASSWORD);
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

/* One ping. Returns metres, or -1 if the echo is missing or out of range. */
float readDistanceOnce(float tempC) {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(4);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(20);            // the waterproof module wants a longer pulse
  digitalWrite(PIN_TRIG, LOW);

  unsigned long duration = pulseIn(PIN_ECHO, HIGH, 30000UL);
  if (duration == 0) return -1.0;

  // Speed of sound varies with air temperature; the DHT22 lets us correct it.
  float speed  = 331.3 + 0.606 * tempC;              // m/s
  float metres = (duration * 1e-6 * speed) / 2.0;    // halve: out and back

  if (metres < SENSOR_MIN_M || metres > SENSOR_MAX_M) return -1.0;
  return metres;
}

/* Median of several pings — rejects the outliers a rippling surface produces.
 * The AJ-SR04M on USB power answers only ~1 ping in 4, but the answers it gives
 * agree to about 1 cm. So keep pinging until SAMPLE_COUNT good ones arrive,
 * up to MAX_PINGS, rather than giving up after a fixed number of tries. */
float readDistanceMedian(float tempC) {
  float samples[SAMPLE_COUNT];
  int valid = 0;
  int tries = 0;

  while (valid < SAMPLE_COUNT && tries < MAX_PINGS) {
    float d = readDistanceOnce(tempC);
    tries++;
    if (d > 0) samples[valid++] = d;
    delay(100);                     // let echoes die away between pings
  }

  if (valid < 3) {                  // not enough good data to trust
    Serial.printf("Only %d of %d pings returned a distance between %.2f and %.2f m\n",
                  valid, tries, SENSOR_MIN_M, SENSOR_MAX_M);
    return -1.0;
  }

  for (int i = 1; i < valid; i++) { // insertion sort
    float key = samples[i];
    int j = i - 1;
    while (j >= 0 && samples[j] > key) { samples[j + 1] = samples[j]; j--; }
    samples[j + 1] = key;
  }
  return samples[valid / 2];
}

float readBatteryPercent() {
  uint32_t total = 0;
  for (int i = 0; i < 8; i++) total += analogReadMilliVolts(PIN_BATTERY);
  float volts = (total / 8.0f) * 2.0f / 1000.0f;   // undo the 1:2 divider
  float pct   = (volts - BATT_EMPTY_V) / (BATT_FULL_V - BATT_EMPTY_V) * 100.0f;
  return constrain(pct, 0.0f, 100.0f);
}

bool postReading(float level, float tempC, float humidity, float battery) {
  String url = "http://" + String(SECRET_SERVER_HOST) + ":" + String(SECRET_SERVER_PORT)
             + "/api/sensors/" + String(SECRET_SENSOR_ID) + "/readings";

  String body = "{\"water_level\":" + String(level, 3);
  if (!isnan(tempC))    body += ",\"temperature\":" + String(tempC, 2);
  if (!isnan(humidity)) body += ",\"humidity\":" + String(humidity, 2);
  if (battery >= 0)     body += ",\"battery_level\":" + String(battery, 1);
  body += "}";

  HTTPClient http;
  http.begin(url);
  http.setTimeout(10000);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Accept", "application/json");
  http.addHeader("Authorization", String("Bearer ") + SECRET_DEVICE_TOKEN);

  int code = http.POST(body);
  Serial.printf("POST %s -> HTTP %d\n", body.c_str(), code);
  if (code == 401) Serial.println("  Token rejected — re-issue with sensors:token");
  if (code == 404) Serial.println("  No sensor with that ID");
  if (code == 422) Serial.println(http.getString());
  if (code <  0)   Serial.println("  Server unreachable — check IP and firewall");

  http.end();
  return code == 201;
}

void loop() {
  if (!firstRun && millis() - lastPost < POST_INTERVAL_MS) return;
  firstRun = false;
  lastPost = millis();

  digitalWrite(PIN_LED, HIGH);
  connectWifi();

  float tempC    = dht.readTemperature();
  float humidity = dht.readHumidity();
  float forSpeed = isnan(tempC) ? 26.0 : tempC;   // Cebu annual average fallback

  float distance = readDistanceMedian(forSpeed);
  if (distance < 0) {
    Serial.println("No usable echo — skipping this cycle");
    digitalWrite(PIN_LED, LOW);
    return;
  }

  // The sensor measures DOWN; the app wants UP.
  float level = MOUNT_HEIGHT_M - distance;
  if (level < 0) level = 0;

  float battery = REPORT_BATTERY ? readBatteryPercent() : -1.0;

  Serial.printf("distance %.3f m | level %.3f m | %.1f C | %.1f %%\n",
                distance, level, tempC, humidity);

  if (WiFi.status() == WL_CONNECTED) {
    postReading(level, tempC, humidity, battery);
  } else {
    Serial.println("Offline — reading discarded");
  }

  digitalWrite(PIN_LED, LOW);
}
