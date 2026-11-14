/* ============================================================
 *  BahaAI — Gate 2: ultrasonic distance
 *
 *  Use the cheap HC-SR04 for this gate. Leave the waterproof
 *  JSN-SR04T in its packet until the code is proven.
 *
 *  WIRING
 *    HC-SR04 VCC  -> ESP32 VIN   (5V — NOT the 3V3 pin)
 *    HC-SR04 GND  -> ESP32 GND
 *    HC-SR04 TRIG -> ESP32 GPIO 17   (direct)
 *    HC-SR04 ECHO -> 1k resistor -> junction -> ESP32 GPIO 16
 *                    junction    -> 2k resistor -> GND
 *  No 1k/2k? Use 10k on top and two 10k in series (20k) to GND.
 *  Same 1:2 ratio, same 3.3 V result.
 *
 *  The divider on ECHO is NOT optional. ECHO idles at 5 V and
 *  ESP32 pins are rated 3.3 V. Wiring it direct can kill the pin.
 *
 *  Pass when printed centimetres track a tape measure as you
 *  move a flat object in front of the sensor.
 * ============================================================ */

#define PIN_TRIG 17
#define PIN_ECHO 16

void setup() {
  Serial.begin(115200);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  digitalWrite(PIN_TRIG, LOW);

  delay(200);
  Serial.println();
  Serial.println("=== BahaAI Gate 2 — ultrasonic ===");
}

void loop() {
  // Trigger pulse. 20 us: the HC-SR04 needs 10+, the waterproof
  // JSN-SR04T / AJ-SR04M reacts more reliably to a longer one.
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(4);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(20);
  digitalWrite(PIN_TRIG, LOW);

  // Time the echo. 30 ms timeout covers the sensor's full range.
  unsigned long duration = pulseIn(PIN_ECHO, HIGH, 30000UL);

  if (duration == 0) {
    Serial.println("no echo  (out of range, or check the wiring)");
  } else {
    Serial.printf("%.1f cm\n", duration / 58.0);
  }

  delay(500);
}
