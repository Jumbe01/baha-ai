/* ============================================================
 *  BahaAI — Gate 6: the ESP32 posts a fixed reading
 *
 *  Same request the laptop sent by hand, now from the board,
 *  with a hardcoded water level so nothing depends on sensors.
 *
 *  Settings live in secrets.h next to this file (Wi-Fi, server
 *  address, sensor ID, device token). It is git-ignored —
 *  never commit or share it.
 *
 *  No sensors needed. If the board browns out on Wi-Fi start,
 *  unplug the 5V wire to the breadboard + rail first.
 *
 *  Pass when the Serial Monitor prints HTTP 201 and a fresh
 *  reading of 1.85 m appears on the sensor's page.
 * ============================================================ */

#include <WiFi.h>
#include <HTTPClient.h>
#include "secrets.h"

void setup() {
  Serial.begin(115200);
  delay(200);
  Serial.println();
  Serial.println("=== BahaAI Gate 6 — post a reading ===");

  WiFi.mode(WIFI_STA);
  WiFi.setTxPower(WIFI_POWER_8_5dBm);  // same brownout workaround as Gate 5
  WiFi.begin(SECRET_WIFI_SSID, SECRET_WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) { delay(400); Serial.print("."); }
  Serial.print("\nWi-Fi up, ESP32 IP: ");
  Serial.println(WiFi.localIP());

  String url = "http://" + String(SECRET_SERVER_HOST) + ":" + String(SECRET_SERVER_PORT)
             + "/api/sensors/" + String(SECRET_SENSOR_ID) + "/readings";

  HTTPClient http;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Accept", "application/json");
  http.addHeader("Authorization", String("Bearer ") + SECRET_DEVICE_TOKEN);

  int code = http.POST("{\"water_level\":1.85}");
  Serial.printf("HTTP %d\n", code);
  Serial.println(http.getString());
  http.end();
}

void loop() {}
