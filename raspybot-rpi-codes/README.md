
## Operating System Installation

For optimal performance, the robot must be running **Raspberry Pi OS Lite** on the Raspberry Pi. This lightweight operating system is specifically designed for headless setups and works seamlessly with the robot's hardware and software requirements.

### Installation Steps:
1. Download the **Raspberry Pi OS Lite** image from the official Raspberry Pi website.

<br>

2. Flash the image onto an SD card using software like **Balena Etcher** or **Raspberry Pi Imager**.

<br>

3. Insert the SD card into the Raspberry Pi, and power it on.

<br>

4. Follow the on-screen instructions to configure your Raspberry Pi, including setting up network access and updating the system packages.

---

## Scripts

This section explains the various scripts used in the system, detailing their purpose and functionality. Each script plays a specific role in setting up, configuring, or running different components of the robot.

### Startup


The `startup.sh` scripts, located in the **`startup-scripts`** directory, are executed automatically when the robot is powered on. 

```bash
./startup.sh
```


### Autonomous Mode

The `run.sh` script, located in the **`raspybot-rpi-codes`** directory, sets up and activates a virtual environment, installs dependencies from `requirements.txt`, and then runs the `main.py` script to start the robot.


```bash
./run.sh
```
---

## Demo

In this demo, the robot is only configured to attack pink-colored balloons.
<p align="center">
  <img src="/assets/video/demo_only_pink_balloon.gif" alt="demo" width="100%" />
</p>

---