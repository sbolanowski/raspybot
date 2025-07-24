# Raspybot Dashboard

The Raspybot Dashboard allows you to monitor live telemetry and control the robot remotely. It provides insights into various aspects of the robot's operation, including motor direction, power applied, ultrasonic sensor readings, live webcam stream, active components list, and control over the robot's movement and weapon system.

<p align="center">
  <img src="/assets/img/dashboard/dashboard.png" alt="dashboard" width="100%" />
</p>

---

## Features

- **Live Telemetry**: Monitor real-time data from the robot, including motor direction, power applied, and sensor readings.
  
<br>

- **Motor Readings**: View the direction of rotation for the motors and the applied power.
  
<br>

- **Ultrasonic Sensor Readings**: Display the real-time distance readings from the ultrasonic sensors.

<br>

- **Webcam Stream**: Stream live video from the robot's webcam to the dashboard for enhanced situational awareness.

<br>

- **Active Components List**: View the status and health of various active components of the robot.

<br>

- **Weapon Control**: Control the robot’s weapon system remotely, including its activation and movement.

<br>

- **Robot Movement Control**: Teleoperate the robot's movement, controlling its direction and speed directly from the dashboard.

---

## Execution

To launch the RaspyBot Dashboard, use the following command:

```bash
./run_dashboard.sh --ip <IP_ADDRESS>
```

### Parameters:
- **`--ip <IP_ADDRESS>`**: If you specify an IP address, the dashboard will connect directly to the Raspberry Pi using the provided IP.
  <br>
- **Without `--ip` parameter**: If no IP address is provided, the dashboard will use `nmap` to search for the Raspberry Pi on the local network automatically.

### Example:

To connect to the robot with a specific IP address:

```bash
./run_dashboard.sh --ip 192.168.1.100
```
<br>

To automatically search for the Raspberry Pi on the local network:

```bash
./run_dashboard.sh
```

---

## Demo

<p align="center">
  <img src="/assets/video/demo_dashboard.gif" alt="demo" width="100%" />
</p>