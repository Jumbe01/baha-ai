/* ============================================================
 *  BahaAI — Gate 5: Wi-Fi association
 *
 *  Edit the two lines below with your network's name and
 *  password. Both are case-sensitive. The ESP32 only joins
 *  2.4 GHz networks — not 5 GHz.
 *
 *  No sensors needed for this gate; any wiring can stay.
 *
 *  Pass when an IP address prints, and its first three numbers
 *  match the laptop's IPv4 address (same network).
 * ============================================================ */

#include <WiFi.h>

const char* WIFI_SSID     = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

void setup() {
  Serial.begin(115200);
  delay(200);
  Serial.println();
  Serial.println("=== BahaAI Gate 5 — Wi-Fi ===");

  WiFi.mode(WIFI_STA);
  // Lower radio power to cut the current spike at connect, which can trip the
  // brownout detector on weak USB power. Remove once the 470 uF capacitor is fitted.
  WiFi.setTxPower(WIFI_POWER_8_5dBm);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting");
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED) {
    if (millis() - start > 20000) {
      Serial.println("\nGave up after 20 s. Check the name, the password, and that the network is 2.4 GHz.");
      return;
    }
    delay(400);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("Connected. ESP32 IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {}
