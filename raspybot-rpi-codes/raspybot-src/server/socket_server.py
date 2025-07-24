# server/socket_server.py

from flask import Flask, request
from flask_socketio import SocketIO
import time
import threading

from hardware.motors import set_motor_power, stop_motors, weapon_active
from utils.logger import logging, Fore, Style
from utils.network import get_local_ip
from system.state import system_state

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading", logger=False, engineio_logger=False)

user_connected = None


def start_socket_server():
    socketio.run(app, host="0.0.0.0", port=5000, use_reloader=False, log_output=False)


@socketio.on("connect")
def handle_connect():
    global user_connected
    user_connected = request.sid
    logging.info(f"{Fore.GREEN}Cliente conectado: {user_connected}{Style.RESET_ALL}")
    socketio.emit("server_message", {"message": "Conexión establecida correctamente"})


@socketio.on("disconnect")
def handle_disconnect():
    global user_connected
    logging.info(f"{Fore.RED}Cliente desconectado: {user_connected}{Style.RESET_ALL}")
    user_connected = None


@socketio.on("set_motors")
def handle_motor_command(command):
    if command == "STOP":
        stop_motors()
    elif command == "WEAPON":
        weapon_active(1.5) 
    else:
        try:
            fr, fl, rr, rl = map(int, command.split(","))
            set_motor_power(fr, fl, rr, rl)
        except ValueError:
            logging.error(f"{Fore.RED}Comando inválido: {command}{Style.RESET_ALL}")


@socketio.on("get_local_ip")
def handle_get_local_ip():
    ip = get_local_ip()
    socketio.emit("local_ip", {"ip": ip})


def emit_ultrasonic_data():
    while True:
        socketio.emit("ultrasonic_data", system_state["sensors"])
        time.sleep(1)


def emit_motor_data():
    while True:
        socketio.emit("motor_data", system_state["motors"])
        time.sleep(1)


def emit_availability():
    while True:
        socketio.emit("availability_status", system_state["availability"])
        time.sleep(5)


def start_periodic_tasks():
    threading.Thread(target=emit_ultrasonic_data, daemon=True).start()
    threading.Thread(target=emit_availability, daemon=True).start()
    threading.Thread(target=emit_motor_data, daemon=True).start()


# Iniciar hilos sockets
start_periodic_tasks()