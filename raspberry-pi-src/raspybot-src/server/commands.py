# server/commands.py

from hardware.motors import set_motor_power, stop_motors, weapon_active
from utils.logger import logging, Fore, Style

def execute_motor_command(command):
    if command == "STOP":
        stop_motors()
        logging.info(f"{Fore.GREEN}Motores detenidos{Style.RESET_ALL}")
    elif command == "WEAPON":
        try:
            weapon_active(1.5) 
            logging.info(f"{Fore.GREEN}Motor arma activado{Style.RESET_ALL}")
        except Exception as e:
            logging.error(f"{Fore.RED}Error al activar motor arma: {e}{Style.RESET_ALL}")
    else:
        try:
            fr, fl, rr, rl = map(int, command.split(","))
            set_motor_power(fr, fl, rr, rl)
            logging.info(f"{Fore.GREEN}Motores ajustados a: {fr}, {fl}, {rr}, {rl}{Style.RESET_ALL}")
        except ValueError:
            logging.error(f"{Fore.RED}Comando inválido: {command}{Style.RESET_ALL}")