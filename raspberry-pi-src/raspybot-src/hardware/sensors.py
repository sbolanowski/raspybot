# hardware/sensors.py

import time
import math
import RPi.GPIO as GPIO
from utils.logger import logging
from system.state import system_state, SENSORS
import threading
import numpy as np


def reset_sensor(sensor):
    GPIO.output(sensor["trigger"], False)
    time.sleep(0.1)
    
    # Reconfigura los pines
    GPIO.setup(sensor["trigger"], GPIO.OUT)
    GPIO.setup(sensor["echo"], GPIO.IN)
    #logging.warning(f"Sensor {sensor} ha sido reseteado.")


def measure_distance(trigger_pin, echo_pin, num_readings=3):
    distances = []

    for _ in range(num_readings):
        GPIO.output(trigger_pin, True)
        time.sleep(0.00001)  # Duración del pulso
        GPIO.output(trigger_pin, False)

        timeout = time.perf_counter() + 0.05

        while GPIO.input(echo_pin) == 0:
            if time.perf_counter() > timeout:
                return 0.00

        start = time.perf_counter()
        timeout = time.perf_counter() + 0.05

        while GPIO.input(echo_pin) == 1:
            if time.perf_counter() > timeout:
                return 0.00

        end = time.perf_counter()

        duration = end - start
        distance = (duration * 34300) / 2  # Distancia en cm
        distances.append(round(distance / 100.0, 2))

        time.sleep(0.02)

    distances = filter_outliers(distances)

    if distances:
        return round(sum(distances) / len(distances), 2)
    else:
        return 0.00
    

def filter_outliers(distances, threshold=2):
    mean = np.mean(distances)
    std_dev = np.std(distances)
    return [dist for dist in distances if abs(dist - mean) <= threshold * std_dev]


def exponential_filter(current_value, previous_value, alpha=0.5):
    return alpha * current_value + (1 - alpha) * previous_value


def read_ultrasonic():
    previous_values = {name: 0.0 for name in SENSORS} 
    max_retries = 5

    GPIO.setmode(GPIO.BCM) # Resetear modo pin

    for sensor in SENSORS.values():
        GPIO.setup(sensor["trigger"], GPIO.OUT)
        GPIO.setup(sensor["echo"], GPIO.IN)

    for sensor in SENSORS.values():
        reset_sensor(sensor)

    time.sleep(0.5)

    while True:
        for name, pins in SENSORS.items():
            retries = 0
            dist = 0.00 

            while retries < max_retries:
                dist = measure_distance(pins["trigger"], pins["echo"])

                if dist != 0.00:
                    dist = exponential_filter(dist, previous_values[name])
                    system_state["sensors"][name] = dist
                    system_state["availability"]["sensors"][name] = True
                    break

                retries += 1
                time.sleep(0.1)  # Esperar entre reintentos

            if dist == 0.00:
                system_state["sensors"][name] = 0.00
                system_state["availability"]["sensors"][name] = False
                #logging.error(f"Sensor {name} no responde después de {max_retries} intentos.")
                
                # Intentar resetear sensor
                reset_sensor(pins)

            previous_values[name] = dist
            time.sleep(0.1)

        time.sleep(0.2)