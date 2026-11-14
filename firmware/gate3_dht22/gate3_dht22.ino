/* ============================================================
 *  BahaAI — Gate 3: temperature and humidity
 *
 *  Library: Sketch -> Include Library -> Manage Libraries,
 *  search "DHT sensor library" by Adafruit, Install, and
 *  choose "Install all" when it asks about dependencies.
 *
 *  WIRING (3-pin DHT22 module, pull-up already on board)
 *    DHT22 +    -> ESP32 3V3   (NOT 5V: the data line follows
 *                               this voltage, and GPIOs are 3.3 V)
 *    DHT22 -    -> GND
 *    DHT22 out  -> ESP32 GPIO 4 (labelled P4 or D4)
 *
 *  The HC-SR04 can stay connected; this sketch ignores it.
 *
 *  Pass when a plausible room temperature and humidity print
 *  every 2.5 seconds, and humidity climbs when you breathe on it.
 * ============================================================ */

#include <DHT.h>

#define PIN_DHT 4

DHT dht(PIN_DHT, DHT22);

void setup() {
  Serial.begin(115200);
  dht.begin();

  delay(200);
  Serial.println();
  Serial.println("=== BahaAI Gate 3 — DHT22 ===");
}

void loop() {
  // The DHT22 refuses reads closer than ~2 s apart.
  delay(2500);

  float t = dht.readTemperature();
  float h = dht.readHumidity();

  if (isnan(t) || isnan(h)) {
    Serial.println("DHT read failed  (check wiring, or try DHT11 if the sensor is blue)");
  } else {
    Serial.printf("%.1f C   %.1f %% humidity\n", t, h);
  }
}
