#!/bin/bash

# Escanear red local, buscar RPI

OUTPUT_FILE="raspberry_ip.txt"

echo "== Buscando Raspberry Pi en la red =="

RPI_IP=$(sudo nmap -sn 192.168.0.0/24 | grep -B 2 "Raspberry Pi" | grep "Nmap scan report" | awk '{print $5}')

if [[ -n "$RPI_IP" ]]; then
    echo "== Raspberry Pi encontrada en: $RPI_IP =="
    echo "$RPI_IP" > "$OUTPUT_FILE"
    echo "== IP guardada en $OUTPUT_FILE =="
else
    echo "!! No se encontró ninguna Raspberry Pi en la red !!"
fi