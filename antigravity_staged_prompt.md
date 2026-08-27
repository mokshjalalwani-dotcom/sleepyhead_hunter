# Staged Prompt: Eye Closure Drowsiness Alarm (for Antigravity / Gemini agent)

How to use: paste one stage at a time into the agent, in order. Don't
paste the whole file at once — let the agent finish and verify each
stage before moving to the next. This keeps it from overreaching, cutting
corners, or inventing scope you didn't ask for.

---

## STAGE 0 — Project brief (paste first, sets context for all later stages)

```
We're building a Python desktop app called "Eye Closure Alarm".

Goal: use the webcam to detect when my eyes are closed continuously for
more than a few seconds, and play an escalating voice alert until I open
my eyes or press a disable button.

Tech constraints:
- Python 3, OpenCV for camera capture and the UI window.
- MediaPipe FaceMesh for facial landmarks (use the eye landmarks to
  compute Eye Aspect Ratio / EAR to determine open vs closed).
- Voice alerts must sound like a natural Indian-accented human voice
  saying casual Hinglish slang — NOT a robotic/generic AI TTS voice.
  Use a proper neural TTS engine for this (ElevenLabs, Azure Neural
  `hi-IN`/`en-IN`, or Google Cloud TTS Wavenet/Neural2 `hi-IN` — agent
  should propose which one and ask me for an API key if needed). Local
  offline TTS (pyttsx3) is only acceptable as a last-resort fallback if
  there's no internet, not as the primary voice.
- Runs cross-platform (Windows/Mac/Linux) as a plain script, no
  packaging/installer needed yet.

Don't write any code yet. First confirm you understand this brief and
list the files you plan to create.
```

---

## STAGE 1 — Environment & scaffolding

```
Set up the project scaffolding:
- eye_closure_alarm.py (main script, empty main() for now)
- requirements.txt with: opencv-python, mediapipe, numpy, pyttsx3
- README.md with install + run instructions

Also verify: can you actually detect and open a webcam and TTS device in
this environment? If webcam/mic hardware isn't accessible from where
you're running, tell me now instead of writing code you can't test.
```

---

## STAGE 2 — Core eye-closure detection

```
Implement the detection core in eye_closure_alarm.py:

1. Open the default webcam with OpenCV, mirror the frame horizontally.
2. Run MediaPipe FaceMesh (max_num_faces=1, refine_landmarks=True) on
   each frame.
3. Compute Eye Aspect Ratio (EAR) per eye using the standard 6-point
   method, average both eyes.
4. Make EAR_THRESHOLD a top-of-file constant (start at 0.21).
5. Overlay the live EAR value and "No face detected" fallback text on
   the video window.
6. Track how many continuous seconds EAR has stayed below threshold,
   resetting to 0 the instant EAR goes back above it. Display this
   elapsed time on screen.

No alarm/audio yet — just get detection and the closed-eye timer
working and visible on screen. Show me the eye landmark indices you
used and why.
```

---

## STAGE 3 — Escalating voice alarm

```
Add the alarm logic:

- CLOSED_TIME_TO_TRIGGER = 4.0 seconds: once eyes have been closed this
  long continuously, start the alarm.
- ALERT_STAGES: an ordered list of {text, volume, rate} dicts:
    1. "uth ja"                        volume 0.5, rate 150
    2. "uth jaaa"                      volume 0.65, rate 165
    3. "uthh jaa"                      volume 0.8, rate 180
    4. "uthhh jaaaa behen ke lode"     volume 1.0, rate 200
- ALERT_REPEAT_INTERVAL = 3.0 seconds between stages, once triggered.
- Once the last stage is reached, keep repeating it every interval
  until eyes reopen or the alarm is disabled.
- Use pyttsx3, and make sure speaking happens on a background thread so
  it never freezes the camera feed. Note: don't share one pyttsx3
  engine instance across threads — create a fresh one per speak call.
- The alarm loop must check every ~0.1s whether it should bail out
  early (eyes reopened / disabled), not just sleep for the full
  interval — I want it to shut up instantly, not after a delay.

Confirm your threading approach before finalizing — I want zero chance
of the video feed freezing or audio overlapping/garbling.
```

---

## STAGE 4 — Instant disable control

```
Add a way to kill the alarm instantly at any point:

- A clickable rectangle button drawn directly on the OpenCV video
  window, labeled "DISABLE ALARM", using a mouse callback.
- Keyboard shortcuts: 'd' to disable, 'r' to manually re-arm, 'q' to
  quit the whole program.
- Behavior: disabling should silence the CURRENT alarm episode
  immediately. It should auto re-arm the next time my eyes close again
  from an open state — I don't want to have to remember to turn it back
  on every time.
- Change the button's color/label depending on armed vs disabled state
  so it's obvious at a glance.

Walk me through exactly what happens, in order, if I click disable
mid-alarm.
```

---

## STAGE 5 — Test, calibrate, and polish

```
Now do a full pass:

1. Point out anything in the current code that could cause the EAR
   threshold to misfire (bad lighting, glasses, camera angle) and add a
   short calibration note to the README about tuning EAR_THRESHOLD.
2. Make sure closing the window / pressing 'q' releases the camera and
   closes cleanly with no orphaned threads.
3. Add a short comment block at the top of the file explaining the EAR
   formula and where the eye landmark indices came from.
4. Update the README with: install steps, espeak requirement on Linux
   for pyttsx3, controls, and how to tune EAR_THRESHOLD /
   CLOSED_TIME_TO_TRIGGER / ALERT_REPEAT_INTERVAL.

Give me a final summary of what was built and any known limitations.
```

---

## OPTIONAL STAGE 6 — Natural-sounding voice (only if you want it later)

```
Right now the alarm uses pyttsx3, which sounds robotic for Hinglish
phrases. Add an alternate TTS backend using gTTS + pydub:
- Pre-generate the 4 alert stage audio clips once (cache them locally as
  .mp3/.wav so we're not hitting the network on every alert).
- Use pydub to progressively boost volume across the 4 cached clips to
  match the same escalation behavior as before.
- Fall back to pyttsx3 automatically if there's no internet connection
  when generating the cache.
Keep the pyttsx3 path intact as the offline fallback — don't rip it out.
```
