import argparse
import threading
import signal
import sys

from hardware.motors import check_motor_availability, stop_motors
from hardware.sensors import read_ultrasonic
from hardware.camera import release_camera
from hardware.oled import actualizar_oled_periodico

from utils.logger import configure_logging
from utils.logger import log_global_state

from server.socket_server import start_socket_server

from autonomous.drive import autonomous_drive 


# ---------------------------------------------------------------------

check_motor_availability()
configure_logging()

# ---------------------------------------------------------------------

def shutdown(signum, frame):
    print("\nRecibido Ctrl+C, cerrando todos los procesos...")
    stop_motors()
    release_camera()
    sys.exit(0)  # Matar programa

signal.signal(signal.SIGINT, shutdown)

# ---------------------------------------------------------------------

# Hilos
socket_server_thread = threading.Thread(target=start_socket_server)
ultrasonic_thread = threading.Thread(target=read_ultrasonic)
logging_thread = threading.Thread(target=log_global_state)
oled_thread = threading.Thread(target=actualizar_oled_periodico)
autonomous_drive_thread = threading.Thread(target=autonomous_drive)

# ---------------------------------------------------------------------

# Iniciar hilos
socket_server_thread.start()
ultrasonic_thread.start()
logging_thread.start()
oled_thread.start()
autonomous_drive_thread.start()

ultrasonic_thread.join()
logging_thread.join()
oled_thread.join()
socket_server_thread.join()
autonomous_drive_thread.join()