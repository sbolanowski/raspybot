# server/status.py

import time
from server.socket_server import socketio

def emit_availability(system_state):
    while True:
        socketio.emit("availability_status", system_state["availability"])
        time.sleep(5)