# system/state.py

# Estado global del sistema
system_state = {
    "motors": {"FR": 0, "FL": 0, "RR": 0, "RL": 0, "Weapon": 0},
    "sensors": {"front": 0.0, "right": 0.0, "left": 0.0},
    "availability": {
        "motors": {"FR": False, "FL": False, "RR": False, "RL": False, "Weapon": False},
        "sensors": {"front": True, "right": True, "left": True}
    },
    "balloons": [] 
}

# Configuración de pines del sensor ultrasónico
SENSORS = {
    "front": {"trigger": 27, "echo": 18},
    "left": {"trigger": 25, "echo": 24},
    "right": {"trigger": 23, "echo": 22}
}