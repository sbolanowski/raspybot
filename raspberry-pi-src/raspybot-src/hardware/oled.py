# hardware/oled.py

import time
import math
import board
import adafruit_ssd1306
from PIL import Image, ImageDraw, ImageFont

from utils.network import get_local_ip
from system.state import system_state 

# Config. Display OLED
i2c = board.I2C()
oled_width = 128
oled_height = 64

try:
    oled = adafruit_ssd1306.SSD1306_I2C(oled_width, oled_height, i2c, addr=0x3C)
    oled.fill(0)
    oled.show()
except Exception as e:
    oled = None
    print(f"[OLED] Error initializing display: {e}")


def mostrar_estado_oled(ip_text):
    if oled is None:
        return

    try:
        oled.fill(0)
        oled.show()

        image = Image.new("1", (oled_width, oled_height))
        draw = ImageDraw.Draw(image)
        font = ImageFont.load_default()

        front = system_state["sensors"].get("front", 0.0)
        left = system_state["sensors"].get("left", 0.0)
        right = system_state["sensors"].get("right", 0.0)

        # Reemplazar NaN
        front_str = f"{front:.2f}" if not math.isnan(front) else "NaN"
        left_str = f"{left:.2f}" if not math.isnan(left) else "NaN"
        right_str = f"{right:.2f}" if not math.isnan(right) else "NaN"

        # Mostrar IP y sensores
        draw.text((0, 0), f"IP: {ip_text}", font=font, fill=255)
        draw.text((0, 15), f"Front Sensor: {front_str}", font=font, fill=255)
        draw.text((0, 30), f"Left Sensor: {left_str}", font=font, fill=255)
        draw.text((0, 45), f"Right Sensor: {right_str}", font=font, fill=255)

        oled.image(image)
        oled.show()

    except Exception as e:
        print(f"[OLED] Error al mostrar estado: {e}")


def actualizar_oled_periodico():
    ip_actual = get_local_ip()

    while True:
        mostrar_estado_oled(ip_actual)
        time.sleep(1)