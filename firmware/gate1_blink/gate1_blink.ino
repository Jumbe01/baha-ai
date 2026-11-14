/* ============================================================
 *  BahaAI — Gate 1: board bring-up
 *
 *  Proves the toolchain, cable, driver and board all work,
 *  before any sensor is connected.
 *
 *  Board : Tools -> Board -> ESP32 Arduino -> ESP32 Dev Module
 *  Port  : Tools -> Port -> COM3
 *  Baud  : 115200 in the Serial Monitor
 *
 *  Pass when the onboard LED blinks once per second AND
 *  "BahaAI node alive" repeats in the Serial Monitor.
 * ============================================================ */

#define PIN_LED 2   // onboard blue LED on most ESP32 devkits

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED, OUTPUT);

  delay(200);
  Serial.println();
  Serial.println("=== BahaAI Gate 1 ===");
  Serial.print("Chip: ");
  Serial.println(ESP.getChipModel());
  Serial.print("Free heap: ");
  Serial.println(ESP.getFreeHeap());
}

void loop() {
  digitalWrite(PIN_LED, HIGH);
  Serial.println("BahaAI node alive");
  delay(500);

  digitalWrite(PIN_LED, LOW);
  delay(500);
}
