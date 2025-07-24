#!/bin/bash
sleep 5

# Desbloquear tarjeta wifi
sudo /usr/sbin/rfkill unblock all

# Activar el entorno python
source /home/raspybot/Codes/raspybot-src/venv/bin/activate

# Ejecutar script chivato ip
exec python3 /home/raspybot/Codes/startup-scripts/startup-ip.py