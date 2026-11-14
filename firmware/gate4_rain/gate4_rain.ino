/* ============================================================
 *  BahaAI — Gate 4: rain module (wet / dry)
 *
 *  This module detects water on its plate. It does NOT measure
 *  millimetres of rain, so the main firmware never sends its
 *  value as rainfall.
 *
 *  WIRING
 *    Copper plate's 2 pins -> control board's 2 pins (either way round)
 *    Control board VCC     -> ESP32 3V3  (keeps AO/DO at 3.3 V)
 *    Control board GND     -> GND
 *    Control board DO      -> ESP32 GPIO 33 (P33)
 *    Control board AO      -> ESP32 GPIO 35 (P35)
 *
 *  DO goes LOW when wet. The blue screw sets that threshold.
 *  AO is 4095 when dry and falls as the plate gets wetter.
 *
 *  Pass when a few drops of water flip the reading to WET and
 *  wiping the plate dry flips it back.
 * ============================================================ */

#define PIN_RAIN_DO 33
#define PIN_RAIN_AO 35

void setup() {
  Serial.begin(115200);
  pinMode(PIN_RAIN_DO, INPUT);

  delay(200);
  Serial.println();
  Serial.println("=== BahaAI Gate 4 — rain module ===");
}

void loop() {
  bool wet = digitalRead(PIN_RAIN_DO) == LOW;
  int raw = analogRead(PIN_RAIN_AO);

  Serial.printf("%s   analog %d\n", wet ? "WET" : "dry", raw);
  delay(1000);
}
