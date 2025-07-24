import cv2
import pygame
import numpy as np

from image_processing import process_frame


def init_pygame(rows, cols, frame_width, frame_height):
    pygame.init()
    screen_width = frame_width * cols
    screen_height = frame_height * rows
    screen = pygame.display.set_mode((screen_width, screen_height))
    pygame.display.set_caption("")
    return screen



def update_pygame_display(screen, frames, rows, cols, frame_width, frame_height):
    window_width = frame_width
    window_height = frame_height

    for i, frame in enumerate(frames):
        x_offset = (i % cols) * window_width
        y_offset = (i // cols) * window_height

        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB) if len(frame.shape) == 3 else frame
        frame = cv2.resize(frame, (window_width, window_height))
        frame_surface = pygame.surfarray.make_surface(np.flip(np.rot90(frame), axis=0))
        screen.blit(frame_surface, (x_offset, y_offset))

    pygame.display.flip()



def initialize_camera():
    for index in range(3):  # Buscar idx webcam
        cap = cv2.VideoCapture(index)
        
        if cap.isOpened():
            print(f"Webcam... {index}")
            return cap
        
    print("Error: no webcam")
    return None



def main():
    cap = initialize_camera()

    ret, frame = cap.read()
    if not ret:
        print("Error: No se pudo capturar la imagen.")
        cap.release()
        return

    frame_height, frame_width, _ = frame.shape

    rows, cols = 1, 1
    screen = init_pygame(rows, cols, frame_width, frame_height)

    try:
        while True:
            ret, frame = cap.read()
            
            detection_frame, detected_circles = process_frame(frame)

            if detected_circles:
                for circle in detected_circles:
                    print(f"Centro (x: {circle['x']}, y: {circle['y']}), Radio: {circle['radius']}")

            frames_to_display = [detection_frame]

            update_pygame_display(screen, frames_to_display, rows, cols, frame_width, frame_height)

            for event in pygame.event.get():
                if event.type == pygame.QUIT or (event.type == pygame.KEYDOWN and event.key == pygame.K_q):
                    raise KeyboardInterrupt

    except KeyboardInterrupt:
        print("Cerrando el programa...")
    finally:
        cap.release()
        pygame.quit()



if __name__ == "__main__":
    main()