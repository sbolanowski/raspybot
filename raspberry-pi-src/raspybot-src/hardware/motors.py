# hardware/motors.py

from adafruit_motorkit import MotorKit
import time
import logging
from tqdm import tqdm
import RPi.GPIO as GPIO

from utils.logger import Fore, Style
from system.state import system_state

# Pines del motor weapon
WEAPON_IN_2_PIN = 6
WEAPON_IN_1_PIN = 5
WEAPON_ENABLE_PIN = 17

kit = None


def check_motor_availability():
    global kit

    GPIO.setmode(GPIO.BCM)
    GPIO.setup(WEAPON_IN_2_PIN, GPIO.OUT)
    GPIO.setup(WEAPON_IN_1_PIN, GPIO.OUT)
    GPIO.setup(WEAPON_ENABLE_PIN, GPIO.OUT)

    try:
        kit = MotorKit()
    except Exception as e:
        logging.error(f"{Fore.RED}Error MotorKit: {e}{Style.RESET_ALL}")
        kit = None

    motor_keys = ["FR", "FL", "RR", "RL", "Weapon"]
    motors = [kit.motor1, kit.motor2, kit.motor3, kit.motor4, None] if kit else [None] * 5

    print(f"\n{Fore.BLUE}{Style.BRIGHT}Checking motors...\n{Style.RESET_ALL}")

    for key, motor in tqdm(zip(motor_keys, motors), total=len(motor_keys), unit="motor", desc="Checking Motors"):
        time.sleep(1)

        if key == "Weapon":
            try:
                GPIO.output(WEAPON_ENABLE_PIN, GPIO.HIGH)

                # Enable motor
                GPIO.output(WEAPON_IN_1_PIN, GPIO.HIGH)
                
                # Giro en sentido 1
                GPIO.output(WEAPON_IN_2_PIN, GPIO.LOW)
                time.sleep(0.75)
                
                GPIO.output(WEAPON_ENABLE_PIN, GPIO.LOW)

                system_state["availability"]["motors"][key] = True
                logging.info(f"{Fore.GREEN}Motor {key} detectado correctamente vía GPIO.\n{Style.RESET_ALL}")
            except Exception as e:
                system_state["availability"]["motors"][key] = False
                logging.error(f"{Fore.RED}Error al detectar {key} vía GPIO: {e}\n{Style.RESET_ALL}")
            continue

        if motor is None:
            system_state["availability"]["motors"][key] = False
            logging.warning(f"{Fore.YELLOW} ⚠ Motor {key} NO DETECTADO\n{Style.RESET_ALL}")
            continue

        try:
            motor.throttle = 0.5
            time.sleep(0.2)
            motor.throttle = 0
            system_state["availability"]["motors"][key] = True
            logging.info(f"{Fore.GREEN}Motor {key} detectado correctamente.\n{Style.RESET_ALL}")
        except Exception as e:
            system_state["availability"]["motors"][key] = False
            logging.error(f"{Fore.RED}Error al detectar {key}: {e}\n{Style.RESET_ALL}")

    GPIO.cleanup()
    print("\nFinal Checks...\nServer Initialization...\n")
    time.sleep(3)


# ======================================================================


def set_motor_power(fl, fr, rl, rr):
    global kit
    
    # Asegurar rango [-1, 1]
    fr = max(-1, min(1, fr))
    fl = max(-1, min(1, fl))
    rr = max(-1, min(1, rr))
    rl = max(-1, min(1, rl))

    system_state["motors"]["FR"] = fr
    system_state["motors"]["FL"] = fl
    system_state["motors"]["RR"] = rr
    system_state["motors"]["RL"] = rl

    if kit:
        kit.motor1.throttle = fl  # Motor delantero derecho (Front Right)
        kit.motor2.throttle = rl  # Motor delantero izquierdo (Front Left)
        kit.motor3.throttle = rr  # Motor trasero derecho (Rear Right)
        kit.motor4.throttle = fr  # Motor trasero izquierdo (Rear Left)


def stop_motors():
    global kit

    for key in system_state["motors"]:
        system_state["motors"][key] = 0.0

    if kit:
        kit.motor1.throttle = 0
        kit.motor2.throttle = 0
        kit.motor3.throttle = 0
        kit.motor4.throttle = 0


# ===============================================
# Funciones para los movimientos predefinidos
# ===============================================

def weapon_active(duration):
    try:
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(WEAPON_ENABLE_PIN, GPIO.OUT)
        GPIO.setup(WEAPON_IN_1_PIN, GPIO.OUT)
        GPIO.setup(WEAPON_IN_2_PIN, GPIO.OUT)

        GPIO.output(WEAPON_ENABLE_PIN, GPIO.HIGH)
        GPIO.output(WEAPON_IN_1_PIN, GPIO.HIGH)
        GPIO.output(WEAPON_IN_2_PIN, GPIO.LOW)
        time.sleep(duration)

        GPIO.output(WEAPON_ENABLE_PIN, GPIO.LOW)

    except Exception as e:
        #logging.error(f"{Fore.RED}Error en activar arma: {e}{Style.RESET_ALL}")
        time.sleep(0.1)


def attack(duration):
    try:
        set_motor_power(1, 1, 1, 1)
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(WEAPON_ENABLE_PIN, GPIO.OUT)
        GPIO.setup(WEAPON_IN_1_PIN, GPIO.OUT)
        GPIO.setup(WEAPON_IN_2_PIN, GPIO.OUT)

        GPIO.output(WEAPON_ENABLE_PIN, GPIO.HIGH)
        GPIO.output(WEAPON_IN_1_PIN, GPIO.HIGH)
        GPIO.output(WEAPON_IN_2_PIN, GPIO.LOW)


        set_motor_power(1, 1, 1, 1)

        time.sleep(duration)

        GPIO.output(WEAPON_ENABLE_PIN, GPIO.LOW)
        stop_motors()

    except Exception as e:
        #logging.error(f"{Fore.RED}Error en ataque: {e}{Style.RESET_ALL}")
        time.sleep(0.1)



def up_movement(duration, power=1):
    set_motor_power(power, power, power, power)
    time.sleep(duration)
    stop_motors()


def down_movement(duration, power=1):
    set_motor_power(-power, -power, -power, -power)
    time.sleep(duration)
    stop_motors()


def left_movement(duration):
    set_motor_power(-1, 1, 1, -1)
    time.sleep(duration)
    stop_motors()


def right_movement(duration):
    set_motor_power(1, -1, -1, 1)
    time.sleep(duration)
    stop_motors()


def upper_left_movement(duration):
    set_motor_power(0, 1, 1, 0)
    time.sleep(duration)
    stop_motors()


def upper_right_movement(duration):
    set_motor_power(1, 0, 0, 1)
    time.sleep(duration)
    stop_motors()


def lower_left_movement(duration):
    set_motor_power(-1, 0, 0, -1)
    time.sleep(duration)
    stop_motors()


def lower_right_movement(duration):
    set_motor_power(0, -1, -1, 0)
    time.sleep(duration)
    stop_motors()


def clockwise_movement(duration, power):
    set_motor_power(power, -power, power, -power)
    time.sleep(duration)
    stop_motors()


def anticlockwise_movement(duration, power):
    set_motor_power(-power, power, -power, power)
    time.sleep(duration)
    stop_motors()


def clockwise_movement_cont(power):
    set_motor_power(power, -power, power, -power)


def anticlockwise_movement_cont(power):
    set_motor_power(-power, power, -power, power)