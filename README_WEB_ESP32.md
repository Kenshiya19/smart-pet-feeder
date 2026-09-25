# Smart Pet Feeder - Web App + ESP32

This version keeps the existing web-app screens/features and changes only the hardware integration layer.

## Connection
- Web app: run with `npm run dev -- --host 0.0.0.0`
- ESP32: use the supplied `ESP32/SmartPetFeeder_Web.ino`
- Default ESP32 IP in the app: `192.168.1.10`
- Laptop and ESP32 must be on the same Wi-Fi network.

## Hardware integration
The web app sends the existing Feed Now and scheduled feed commands to:
`http://192.168.1.10/feed?target=30`

The ESP32 performs the real dispensing. The load cell controls when the target amount is reached; the servo closes afterward. The app's existing animation/history/notifications remain in place.

## Tested pin mapping used by this integration firmware
- HX711 DOUT: GPIO 19
- HX711 SCK: GPIO 18
- Servo signal: GPIO 13
- LED: GPIO 2
- IR sensor: GPIO 27
- Buzzer: GPIO 15 (do not drive a 5V buzzer directly from ESP32 GPIO; use a transistor/driver)

The HC-SR04 is intentionally not required for Feed Now testing. Add it only after its voltage-divider wiring is working.

## Important
The Blynk/cloud template values from the original reference code are not used by this web integration.
