/* ============================================================
 *  BahaAI — Actuator Node (relays)
 *  Polls GET /api/actuators?zone={ZONE_ID} and mirrors each device's
 *  is_on onto a relay. Uses the same secrets.h as the sensor node
 *  (Wi-Fi + server address); git-ignored, never commit it.
 *
 *  WIRING (relay board -> ESP32)
 *    VCC -> 5V rail   GND -> GND rail
 *    IN1 -> P26 pump  IN2 -> P27 siren  IN3 -> P14 floodgate  IN4 -> P13 spare
 *  Needs library: ArduinoJson (Benoit Blanchon), version 7.
 * ============================================================ */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "secrets.h"

/* ---------- EDIT THIS BLOCK ---------- */
const int ZONE_ID = 1;                         // flood zone whose devices this node drives
// 5 s for testing and the demo; 30 s in the field to save battery.
const unsigned long POLL_INTERVAL_MS = 5UL * 1000UL;
/* ------------------------------------- */

#define RELAY_ACTIVE_LOW true                  // confirmed in Gate 7
#define RELAY_PUMP   26
#define RELAY_SIREN  27
#define RELAY_GATE   14
#define RELAY_SPARE  13                        // unused, but held off: a floating input glows dim

unsigned long lastPoll = 0;
bool firstRun = true;

void setRelay(int pin, bool on) {
  digitalWrite(pin, (on == RELAY_ACTIVE_LOW) ? LOW : HIGH);
}

void connectWifi() {
  if (WiFi.status() == WL_CONNECTED) return;
  WiFi.mode(WIFI_STA);
  WiFi.setTxPower(WIFI_POWER_8_5dBm);          // same brownout fix as the sensor node
  WiFi.begin(SECRET_WIFI_SSID, SECRET_WIFI_PASSWORD);
  Serial.print("Wi-Fi connecting");
  unsigned long started = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - started < 20000UL) {
    delay(400);
    Serial.print(".");
  }
  Serial.println();
  Serial.println(WiFi.status() == WL_CONNECTED ? "Wi-Fi up" : "Wi-Fi failed — retry next cycle");
}

void setup() {
  Serial.begin(115200);
  int pins[] = { RELAY_PUMP, RELAY_SIREN, RELAY_GATE, RELAY_SPARE };
  for (int pin : pins) {
    // Output mode first: on ESP32 core 3.x a digitalWrite before pinMode is
    // ignored, the pin starts LOW, and LOW switches an active-low relay ON.
    pinMode(pin, OUTPUT);
    setRelay(pin, false);
  }
  Serial.println("\n=== BahaAI actuator node ===");
  connectWifi();
}

void pollActuators() {
  String url = "http://" + String(SECRET_SERVER_HOST) + ":" + String(SECRET_SERVER_PORT)
             + "/api/actuators?zone=" + String(ZONE_ID);

  HTTPClient http;
  http.begin(url);
  http.setTimeout(10000);
  http.addHeader("Accept", "application/json");

  int code = http.GET();
  if (code != 200) {
    // Keep the last state rather than switching everything off: a Wi-Fi blip
    // must not stop a pump mid-flood.
    Serial.printf("actuator poll -> HTTP %d (keeping last state)\n", code);
    http.end();
    return;
  }

  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, http.getString());
  http.end();
  if (err) {
    Serial.println("actuator JSON parse failed");
    return;
  }

  for (JsonObject device : doc["devices"].as<JsonArray>()) {
    const char* type = device["type"];
    bool on = device["is_on"];
    if      (strcmp(type, "pump") == 0)                                  setRelay(RELAY_PUMP, on);
    else if (strcmp(type, "siren") == 0)                                 setRelay(RELAY_SIREN, on);
    else if (strcmp(type, "floodgate") == 0 || strcmp(type, "valve") == 0) setRelay(RELAY_GATE, on);
    Serial.printf("  %-10s %s\n", type, on ? "ON" : "off");
  }
}

void loop() {
  if (!firstRun && millis() - lastPoll < POLL_INTERVAL_MS) return;
  firstRun = false;
  lastPoll = millis();

  connectWifi();
  if (WiFi.status() == WL_CONNECTED) pollActuators();
}
