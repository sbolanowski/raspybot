import threading
import random
import queue
import cv2
import time

from hardware.motors import (
    up_movement, down_movement, left_movement, right_movement,
    clockwise_movement, anticlockwise_movement, stop_motors, weapon_active, attack, anticlockwise_movement_cont, clockwise_movement_cont
)
from system.state import system_state 
from hardware.camera import initialize_camera, capture_frame
from autonomous.image_processing import process_frame
from server.socket_server import socketio
import base64


# VARIABLES COMPORTAMIENTO AUTONOMO ---------------------------

frame_queue = queue.Queue(maxsize=20)
last_balloon_side = None  # Left o Right
centered = False
attacking = False

# Constantes PID TEST
#KP = 0.005  # Constante proporcional
#KI = 0.0001  # Constante integral
#KD = 0.001  # Constante derivativa

KP = 0.0025
KI = 0.00003
KD = 0.0004


MIN_POWER = 0.85  # Potencia mínima
MAX_POWER = 1.0  # Potencia máxima

DIST_THRESHOLD = 0.2 # Distancia segura sensores
DIST_THRESHOLD_LAT = 0.3 # Distancia segura sensores
ATTK_RANGE = 0.25 # Distancia máx globo para atacar

previous_error = 0
integral = 0

# -----------------------------------------------------------


def process_images():
    global last_balloon_side
    while True:
        frame = frame_queue.get()
        if frame is not None:
            detection_frame, detected_circles = process_frame(frame)
            system_state["balloons"] = detected_circles
            
            if detected_circles:
                largest_balloon = max(detected_circles, key=lambda b: b["radius"])
                center_x = 160
                if largest_balloon["x"] < center_x:
                    last_balloon_side = "left"
                else:
                    last_balloon_side = "right"
            else:
                last_balloon_side = last_balloon_side

            send_frame_to_server(detection_frame)
        frame_queue.task_done()


def capture_images(camera):
    while True:
        frame = capture_frame(camera)
        if frame is not None and not frame_queue.full():
            frame_queue.put(frame)
        time.sleep(0.05)

def webcam_init():
    camera = initialize_camera()
    threading.Thread(target=capture_images, args=(camera,), daemon=True).start()
    threading.Thread(target=process_images, daemon=True).start()


# -----------------------------------------------------------


def handle_obstacles():
    global centered

    while True:
        try:
            # SysState
            front_distance = system_state["sensors"]["front"]
            left_distance = system_state["sensors"]["left"]
            right_distance = system_state["sensors"]["right"]

            if front_distance < DIST_THRESHOLD and right_distance < DIST_THRESHOLD_LAT:  # Obstáculo frente y a la derecha
                anticlockwise_movement(1, 1)

            elif front_distance < DIST_THRESHOLD and left_distance < DIST_THRESHOLD_LAT:  # Obstáculo frente y a la izquierda
                clockwise_movement(1, 1)

            elif right_distance < DIST_THRESHOLD_LAT:  # Si obstáculo a la derecha
                left_movement(2)

            elif left_distance < DIST_THRESHOLD_LAT:  # Si obstáculo a la izquierda
                right_movement(2)

        except Exception as e:
            print(f"[ERROR en handle_obstacles] {e}")

        time.sleep(0.1)


def handle_motors():
    global previous_error, integral, last_balloon_side, centered, attacking
    initial_sweep = True
    attack_start_time = None
    attack_duration = 5  # segundos

    while True:
        try:
            if centered and not attacking:
                attacking = True
                attack_start_time = time.time()
                attack(attack_duration)

            if attacking:
                if time.time() - attack_start_time >= attack_duration:
                    attacking = False
                    centered = False
                    initial_sweep = True
                else:
                    continue

            if initial_sweep:
                clockwise_movement_cont(MIN_POWER)
                balloons = system_state.get("balloons")

                if balloons:
                    initial_sweep = False
                    stop_motors()
                    continue

                if random.uniform(3, 6) < 0.5:
                    up_movement(3, MAX_POWER)

            else:
                balloons = system_state.get("balloons")

                if balloons:
                    largest_balloon = max(balloons, key=lambda b: b["radius"])
                    x_position = largest_balloon["x"]
                    center_x = 160
                    difference = abs(x_position - center_x)
                    balloon_radius = largest_balloon["radius"]
                    threshold = 60

                    if balloon_radius < 90:
                        up_movement(0.2, MIN_POWER)
                        integral = 0
                        previous_error = 0
                        centered = False
                        continue

                    if 100 <= balloon_radius <= 150:
                        threshold = 80

                    if difference <= threshold:
                        stop_motors()
                        integral = 0
                        previous_error = 0
                        centered = True
                        continue

                    error = x_position - center_x
                    integral += error
                    integral = max(min(integral, 1000), -1000)
                    derivative = error - previous_error
                    power = (KP * error) + (KI * integral) + (KD * derivative)
                    power = min(MAX_POWER, max(MIN_POWER, abs(power)))
                    previous_error = error

                    if error < 0:
                        anticlockwise_movement(0.2, power)
                        last_balloon_side = "left"
                    else:
                        clockwise_movement(0.2, power)
                        last_balloon_side = "right"
                else:
                    if last_balloon_side == "left":
                        anticlockwise_movement_cont(MIN_POWER)
                    elif last_balloon_side == "right":
                        clockwise_movement_cont(MIN_POWER)
                    else:
                        clockwise_movement_cont(MIN_POWER)

        except Exception as e:
            stop_motors()

        time.sleep(0.1)


# -----------------------------------------------------------


def autonomous_init():
    threading.Thread(target=handle_obstacles, daemon=True).start()
    threading.Thread(target=handle_motors, daemon=True).start()
    time.sleep(0.1)


def autonomous_drive():
    webcam_init()
    autonomous_init()

    while True:
        time.sleep(1)


def send_frame_to_server(frame):
    _, buffer = cv2.imencode('.jpg', frame)
    frame_base64 = base64.b64encode(buffer.tobytes()).decode('utf-8')
    socketio.emit('video_frame', {'frame': frame_base64})