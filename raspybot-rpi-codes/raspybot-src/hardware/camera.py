# hardware/camera.py

import cv2

def initialize_camera():
    for index in range(3):  # Buscar idx webcam
        cap = cv2.VideoCapture(index)
        
        if cap.isOpened():
            print(f"Webcam... {index}")
            return cap
        
    print("Error: no webcam")
    return None

def capture_frame(cap):
    ret, frame = cap.read()
    if not ret:
        print("Error: frame capturado")
        return None
    return frame

def release_camera(cap):
    cap.release()