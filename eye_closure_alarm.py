import cv2
import sys
from unittest.mock import MagicMock
sys.modules['tensorflow'] = MagicMock()
import mediapipe as mp
import time
import math
import threading
import pyttsx3
import os
import asyncio
import edge_tts
import pygame

# ==============================================================================
# Eye Closure Alarm
# ==============================================================================
# EAR Formula: (||P2 - P6|| + ||P3 - P5||) / (2.0 * ||P1 - P4||)
# 
# Eye Landmark Indices (MediaPipe 468-point Face Mesh):
# We use the specific points corresponding to the 6 points of the eye contour:
# - Left eye: 33 (outer corner, P1), 160/158 (top edge, P2/P3), 
#   133 (inner corner, P4), 153/144 (bottom edge, P5/P6)
# - Right eye: 362 (inner corner, P1), 385/387 (top edge, P2/P3),
#   263 (outer corner, P4), 373/380 (bottom edge, P5/P6)
# ==============================================================================

# --- Constants & Thresholds ---
EAR_THRESHOLD = 0.21
CLOSED_TIME_TO_TRIGGER = 4.0
ALERT_REPEAT_INTERVAL = 3.0
AUDIO_CACHE_DIR = "audio_cache"

ALERT_STAGES = [
    {"text": "uth ja", "volume": 0.5, "rate": 150, "filename": "stage_1.mp3"},
    {"text": "uth jaa", "volume": 0.65, "rate": 165, "filename": "stage_2.mp3"},
    {"text": "uth jaaaa", "volume": 0.8, "rate": 180, "filename": "stage_3.mp3"},
    {"text": "uth jaaaaaa behen ke low day", "volume": 1.0, "rate": 200, "filename": "stage_4.mp3"},
]

LEFT_EYE_INDICES = [33, 160, 158, 133, 153, 144]
RIGHT_EYE_INDICES = [362, 385, 387, 263, 373, 380]

# --- Global UI State ---
alarm_armed = True
button_rect = (400, 20, 200, 50)  # (x, y, w, h)
quit_button_rect = (50, 20, 100, 50)
quit_requested = False

def euclidean_distance(p1, p2):
    return math.dist(p1, p2)

def compute_ear(landmarks, indices, img_w, img_h):
    pts = [(landmarks[idx].x * img_w, landmarks[idx].y * img_h) for idx in indices]
    v1 = euclidean_distance(pts[1], pts[5])
    v2 = euclidean_distance(pts[2], pts[4])
    h = euclidean_distance(pts[0], pts[3])
    if h == 0:
        return 0.0
    return (v1 + v2) / (2.0 * h)

def generate_edge_tts_cache():
    """Generates the natural Indian voice audio files using edge-tts if they don't exist."""
    if not os.path.exists(AUDIO_CACHE_DIR):
        os.makedirs(AUDIO_CACHE_DIR)
        
    async def _generate():
        # hi-IN-SwaraNeural or en-IN-NeerjaNeural provide natural Hinglish pronunciations
        voice = "hi-IN-SwaraNeural" 
        for stage in ALERT_STAGES:
            filepath = os.path.join(AUDIO_CACHE_DIR, stage["filename"])
            if not os.path.exists(filepath):
                print(f"Generating TTS cache: {filepath}")
                communicate = edge_tts.Communicate(stage["text"], voice)
                await communicate.save(filepath)

    try:
        asyncio.run(_generate())
        return True
    except Exception as e:
        print(f"Failed to generate Edge TTS cache (offline?): {e}")
        return False

class AlarmManager:
    def __init__(self):
        self.eyes_closed_duration = 0.0
        self.stop_requested = False
        self.force_silence = False
        self.use_pygame = True
        
        try:
            pygame.mixer.init()
        except Exception:
            self.use_pygame = False
            print("Pygame mixer failed to initialize. Falling back to pyttsx3 ONLY.")

        self.thread = threading.Thread(target=self._alarm_loop, daemon=True)
        self.thread.start()
        
    def update_duration(self, duration):
        self.eyes_closed_duration = duration

    def silence_current(self):
        """Instantly silence the alarm until eyes open again."""
        self.force_silence = True
        if self.use_pygame and pygame.mixer.music.get_busy():
            pygame.mixer.music.stop()
            
    def rearm(self):
        self.force_silence = False

    def stop_thread(self):
        self.stop_requested = True
        self.silence_current()
        self.thread.join(timeout=1.0)
        
    def _speak_pyttsx3(self, text, volume, rate):
        if self.force_silence or self.stop_requested:
            return
        try:
            engine = pyttsx3.init()
            engine.setProperty('rate', rate)
            engine.setProperty('volume', volume)
            engine.say(text)
            engine.runAndWait()
        except Exception as e:
            print(f"Pyttsx3 TTS Error: {e}")

    def _play_audio_file(self, filepath, volume):
        if self.force_silence or self.stop_requested:
            return
        try:
            pygame.mixer.music.load(filepath)
            pygame.mixer.music.set_volume(volume)
            pygame.mixer.music.play()
            while pygame.mixer.music.get_busy() and not (self.force_silence or self.stop_requested):
                time.sleep(0.05)
        except Exception as e:
            print(f"Pygame Error: {e}")
            
    def _alarm_loop(self):
        current_stage = 0
        last_alert_time = 0.0
        
        while not self.stop_requested:
            if self.force_silence:
                current_stage = 0
                last_alert_time = 0.0
                time.sleep(0.1)
                continue

            if self.eyes_closed_duration >= CLOSED_TIME_TO_TRIGGER:
                now = time.time()
                
                if last_alert_time == 0.0 or (now - last_alert_time >= ALERT_REPEAT_INTERVAL):
                    stage_data = ALERT_STAGES[current_stage]
                    filepath = os.path.join(AUDIO_CACHE_DIR, stage_data["filename"])
                    
                    if self.use_pygame and os.path.exists(filepath):
                        self._play_audio_file(filepath, stage_data["volume"])
                    else:
                        self._speak_pyttsx3(stage_data["text"], stage_data["volume"], stage_data["rate"])
                    
                    last_alert_time = time.time()
                    
                    if current_stage < len(ALERT_STAGES) - 1:
                        current_stage += 1
            else:
                current_stage = 0
                last_alert_time = 0.0
                
            time.sleep(0.1)

def mouse_callback(event, x, y, flags, param):
    global alarm_armed, quit_requested
    alarm_manager = param
    if event == cv2.EVENT_LBUTTONDOWN:
        bx, by, bw, bh = button_rect
        if bx <= x <= bx + bw and by <= y <= by + bh:
            alarm_armed = False
            alarm_manager.silence_current()
            print("Alarm disabled via UI.")
            
        qx, qy, qw, qh = quit_button_rect
        if qx <= x <= qx + qw and qy <= y <= qy + qh:
            quit_requested = True
            print("Quit requested via UI.")

def draw_ui(frame):
    # Draw Disable Button
    bx, by, bw, bh = button_rect
    if alarm_armed:
        color = (0, 200, 0)
        label = "ALARM: ARMED"
    else:
        color = (0, 0, 200)
        label = "DISABLED (Click)"
        
    cv2.rectangle(frame, (bx, by), (bx+bw, by+bh), color, -1)
    cv2.rectangle(frame, (bx, by), (bx+bw, by+bh), (255, 255, 255), 2)
    
    text_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)[0]
    tx = bx + (bw - text_size[0]) // 2
    ty = by + (bh + text_size[1]) // 2
    cv2.putText(frame, label, (tx, ty), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

    # Draw Quit Button
    qx, qy, qw, qh = quit_button_rect
    cv2.rectangle(frame, (qx, qy), (qx+qw, qy+qh), (50, 50, 50), -1)
    cv2.rectangle(frame, (qx, qy), (qx+qw, qy+qh), (255, 255, 255), 2)
    q_label = "QUIT"
    q_text_size = cv2.getTextSize(q_label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)[0]
    q_tx = qx + (qw - q_text_size[0]) // 2
    q_ty = qy + (qh + q_text_size[1]) // 2
    cv2.putText(frame, q_label, (q_tx, q_ty), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

def main():
    global alarm_armed, quit_requested
    
    print("Pre-generating TTS cache (if needed)...")
    generate_edge_tts_cache()

    mp_face_mesh = mp.solutions.face_mesh
    face_mesh = mp_face_mesh.FaceMesh(
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    alarm_manager = AlarmManager()
    cv2.namedWindow('Eye Closure Alarm')
    cv2.setMouseCallback('Eye Closure Alarm', mouse_callback, param=alarm_manager)

    closed_start_time = None
    elapsed_closed_time = 0.0
    
    print("Controls: 'd' to disable, 'r' to rearm, 'q' to quit.")

    while True:
        success, frame = cap.read()
        if not success:
            continue

        frame = cv2.flip(frame, 1)
        img_h, img_w, _ = frame.shape

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        rgb_frame.flags.writeable = False
        results = face_mesh.process(rgb_frame)
        rgb_frame.flags.writeable = True
        
        avg_ear = 0.0

        if results.multi_face_landmarks:
            landmarks = results.multi_face_landmarks[0].landmark
            left_ear = compute_ear(landmarks, LEFT_EYE_INDICES, img_w, img_h)
            right_ear = compute_ear(landmarks, RIGHT_EYE_INDICES, img_w, img_h)
            avg_ear = (left_ear + right_ear) / 2.0

            # Logic for eyes closed
            if avg_ear < EAR_THRESHOLD:
                if closed_start_time is None:
                    closed_start_time = time.time()
                elapsed_closed_time = time.time() - closed_start_time
            else:
                closed_start_time = None
                elapsed_closed_time = 0.0
                
                # Auto re-arm when eyes open again
                if not alarm_armed:
                    alarm_armed = True
                    alarm_manager.rearm()
        else:
            closed_start_time = None
            elapsed_closed_time = 0.0
            cv2.putText(frame, "No face detected", (20, 50), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

        # Only pass duration if armed
        if alarm_armed:
            alarm_manager.update_duration(elapsed_closed_time)
        else:
            alarm_manager.update_duration(0.0)

        # Drawing Overlays
        cv2.putText(frame, f"EAR: {avg_ear:.3f}", (20, 50), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        timer_color = (0, 0, 255) if elapsed_closed_time > 0 else (0, 255, 0)
        cv2.putText(frame, f"Closed: {elapsed_closed_time:.1f}s", (20, 100), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, timer_color, 2)
        
        if elapsed_closed_time >= CLOSED_TIME_TO_TRIGGER and alarm_armed:
            cv2.putText(frame, "ALARM ACTIVE!", (20, 150), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 255), 3)

        draw_ui(frame)
        cv2.imshow('Eye Closure Alarm', frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('q') or quit_requested:
            break
        elif key == ord('d'):
            alarm_armed = False
            alarm_manager.silence_current()
        elif key == ord('r'):
            alarm_armed = True
            alarm_manager.rearm()

    # Clean Exit
    print("Shutting down cleanly...")
    alarm_manager.stop_thread()
    cap.release()
    cv2.destroyAllWindows()
    face_mesh.close()
    if alarm_manager.use_pygame:
        pygame.mixer.quit()

if __name__ == "__main__":
    main()
