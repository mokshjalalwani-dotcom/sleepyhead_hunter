# Eye Closure Alarm

A Python desktop application that uses your webcam to detect prolonged eye closure, and plays an escalating voice alarm (in a natural Indian Hinglish voice) until you open your eyes or disable it.

## Prerequisites & Installation

1. **Python 3** (Tested on Python 3.9+)
2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. **Linux Users Only**: The offline fallback TTS (`pyttsx3`) requires `espeak`. Install it via your package manager:
   ```bash
   sudo apt-get install espeak
   ```

## Usage

Run the main script:
```bash
python eye_closure_alarm.py
```
On the first run, the app will briefly download and cache the natural voice alerts using `edge-tts`. If you are offline, it will automatically fallback to the local `pyttsx3` robotic voice.

### Controls
* **Mouse**: Click the **DISABLE ALARM** button on the video window to instantly silence an active alarm.
* **Keyboard 'd'**: Disable the alarm.
* **Keyboard 'r'**: Manually re-arm the alarm.
* **Keyboard 'q'**: Quit the application safely.

*(Note: The alarm automatically re-arms itself the next time your eyes are fully opened and then closed again.)*

## Calibration & Tuning

Depending on your webcam angle, lighting, or if you wear glasses, the default Eye Aspect Ratio (EAR) might misfire. You can tune these constants at the top of `eye_closure_alarm.py`:

* `EAR_THRESHOLD = 0.21` 
  * Increase this (e.g. `0.23`) if the alarm doesn't trigger when your eyes are closed. 
  * Decrease this (e.g. `0.19`) if it triggers mistakenly while your eyes are open or looking down.
* `CLOSED_TIME_TO_TRIGGER = 4.0`
  * How many continuous seconds your eyes must be closed before the first alarm stage triggers.
* `ALERT_REPEAT_INTERVAL = 3.0`
  * The time in seconds between escalating alarm stages.
