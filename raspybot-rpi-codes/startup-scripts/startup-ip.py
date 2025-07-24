import socket
import time
import threading
from PIL import Image, ImageDraw, ImageFont
import board
import adafruit_ssd1306


# ==========================================

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


# ==========================================

# Getter dir. IP
def get_ip_address():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(1)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "No IP"
    

# ==========================================

# Mostrar IP en Display
def show_ip(ip):
    if oled is None:
        return

    try:
        oled.fill(0)
        oled.show()

        image = Image.new("1", (oled_width, oled_height))
        draw = ImageDraw.Draw(image)
        font = ImageFont.load_default()
        draw.text((0, 0), f"IP: {ip}", font=font, fill=255)

        oled.image(image)
        oled.show()
    except Exception as e:
        print(f"[OLED] Error al mostrar estado: {e}")


# ==========================================

# Actualizar
def update_display():
    while True:
        ip = get_ip_address()
        show_ip(ip)
        time.sleep(5)


# ==========================================

# Hilo principal
thread_ip = threading.Thread(target=update_display)
thread_ip.daemon = True
thread_ip.start()

while True:
    time.sleep(1)