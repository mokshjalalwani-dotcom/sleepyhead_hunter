import cv2
import pyttsx3

def test_webcam():
    print("Testing webcam...")
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Failed to open webcam.")
        return False
    ret, frame = cap.read()
    if not ret:
        print("Failed to read frame from webcam.")
        cap.release()
        return False
    print(f"Successfully read frame of shape: {frame.shape}")
    cap.release()
    return True

def test_tts():
    print("Testing pyttsx3 TTS...")
    try:
        engine = pyttsx3.init()
        engine.say("Testing audio output")
        engine.runAndWait()
        print("Successfully ran TTS engine.")
        return True
    except Exception as e:
        print(f"TTS failed: {e}")
        return False

if __name__ == "__main__":
    cam_ok = test_webcam()
    tts_ok = test_tts()
    
    if cam_ok and tts_ok:
        print("\nENVIRONMENT TEST PASSED!")
    else:
        print("\nENVIRONMENT TEST FAILED.")
