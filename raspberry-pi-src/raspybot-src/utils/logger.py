# utils/logger.py

import logging
import sys
import time
from tabulate import tabulate
from colorama import Fore, Style

from utils.network import get_local_ip
from system.state import system_state 

def configure_logging():
    logging.basicConfig(
        format=f"{Fore.CYAN}[%(asctime)s]{Style.RESET_ALL} %(message)s",
        level=logging.INFO,
        datefmt="%H:%M:%S"
    )

def color_distance(val):
    try:
        dist = float(val)
        dist = round(dist, 2)

        if dist < 0.1:
            return f"{Fore.RED}{dist}{Style.RESET_ALL}"
        elif dist < 0.3:
            return f"{Fore.YELLOW}{dist}{Style.RESET_ALL}"
        elif dist < 1.0:
            return f"{Fore.GREEN}{dist}{Style.RESET_ALL}"
        else:
            return f"{Fore.BLUE}{dist}{Style.RESET_ALL}"
    except:
        return f"{Fore.LIGHTBLACK_EX}NaN{Style.RESET_ALL}"



def log_global_state():
    server_ip = get_local_ip()
    server_info = f"\n{Fore.BLUE}{Style.BRIGHT}>  WebSocket Server @ [{server_ip}:5000]\n{Style.RESET_ALL}"

    while True:

        # Tabla de Motores
        motor_table = tabulate(
            [
                ["V", system_state["motors"]["FL"], system_state["motors"]["FR"], system_state["motors"]["RL"], system_state["motors"]["RR"], system_state["motors"]["Weapon"]],
                ["Status",
                 f"{f'{Fore.GREEN}███{Style.RESET_ALL}' if system_state['availability']['motors']['FL'] else f'{Fore.RED}███{Style.RESET_ALL}'}",
                 f"{f'{Fore.GREEN}███{Style.RESET_ALL}' if system_state['availability']['motors']['FR'] else f'{Fore.RED}███{Style.RESET_ALL}'}",
                 f"{f'{Fore.GREEN}███{Style.RESET_ALL}' if system_state['availability']['motors']['RL'] else f'{Fore.RED}███{Style.RESET_ALL}'}",
                 f"{f'{Fore.GREEN}███{Style.RESET_ALL}' if system_state['availability']['motors']['RR'] else f'{Fore.RED}███{Style.RESET_ALL}'}",
                 f"{f'{Fore.GREEN}███{Style.RESET_ALL}' if system_state['availability']['motors']['Weapon'] else f'{Fore.RED}███{Style.RESET_ALL}'}"]
            ],
            headers=["Motor", "FL", "FR", "RL", "RR", "Weapon"],
            tablefmt="fancy_grid",
            colalign=("center", "center", "center", "center", "center", "center")
        )

        # Tabla de Sensores
        sensor_table = tabulate(
            [
                ["Dist. (m)",
                    color_distance(system_state["sensors"]["front"]),
                    color_distance(system_state["sensors"]["left"]),
                    color_distance(system_state["sensors"]["right"])
                ],
                ["Status",
                 f"{f'{Fore.GREEN}███{Style.RESET_ALL}' if system_state['availability']['sensors']['front'] else f'{Fore.RED}███{Style.RESET_ALL}'}",
                 f"{f'{Fore.GREEN}███{Style.RESET_ALL}' if system_state['availability']['sensors']['left'] else f'{Fore.RED}███{Style.RESET_ALL}'}",
                 f"{f'{Fore.GREEN}███{Style.RESET_ALL}' if system_state['availability']['sensors']['right'] else f'{Fore.RED}███{Style.RESET_ALL}'}"]
            ],
            headers=["Sensor", "Front", "Left", "Right"],
            tablefmt="fancy_grid",
            colalign=("center", "center", "center", "center")
        )

        # Globos detectados
        if system_state["balloons"]:
            # Mayor radio
            largest_balloon = max(system_state["balloons"], key=lambda b: b["radius"])
            
            balloon_table = tabulate(
                [
                    [
                        f"Globo_{i+1}",
                        f"{Fore.BLUE if balloon == largest_balloon else ''}{balloon['x']}{Style.RESET_ALL}",
                        f"{Fore.BLUE if balloon == largest_balloon else ''}{balloon['y']}{Style.RESET_ALL}",
                        f"{Fore.BLUE if balloon == largest_balloon else ''}{balloon['radius']:.2f}{Style.RESET_ALL}"
                    ] 
                    for i, balloon in enumerate(system_state["balloons"])
                ],
                headers=["ID", "X", "Y", "Radio"],
                tablefmt="fancy_grid",
                colalign=("center", "center", "center", "center")
            )
        else:
            balloon_table = "No balloon detected..."

        # Mensaje de salida
        exit_message = f"{Fore.LIGHTYELLOW_EX}{Style.BRIGHT} ⚠ Press CTRL + C to exit{Style.RESET_ALL}"

        sys.stdout.write("\033[H\033[J")  # Código ANSI para limpiar la terminal
        print(server_info)
        print(f"{motor_table}\n")
        print(f"{sensor_table}\n")
        print(f"{balloon_table}\n")
        print(f"{exit_message}\n")

        time.sleep(0.5)