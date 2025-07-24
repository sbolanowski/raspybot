#!/bin/bash

ENV_FILE=".env"
USE_MANUAL_IP=false
MANUAL_IP=""

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --ip)
            USE_MANUAL_IP=true
            MANUAL_IP="$2"
            shift 2
            ;;
        *)
            echo "❌ Opción desconocida: $1"
            echo "Uso: $0 [--ip <dirección_ip>]"
            exit 1
            ;;
    esac
done

# Si arg IP
if [ "$USE_MANUAL_IP" = true ]; then
    echo "== Usando IP proporcionada: $MANUAL_IP =="
    RPI_IP="$MANUAL_IP"
else
    echo "== Buscando Raspberry Pi en la red =="

    RPI_IP=$(sudo nmap -sn 192.168.0.0/24 | grep -B 2 "Raspberry Pi" | grep "Nmap scan report" | awk '{print $5}')

    if [[ -z "$RPI_IP" ]]; then
        echo "!! No se encontró ninguna Raspberry Pi en la red !!"
        exit 1
    fi

    echo "== Raspberry Pi encontrada en: $RPI_IP =="
fi

# Guardar IP en .env
echo "NEXT_PUBLIC_SOCKET_URL=http://$RPI_IP:5000" > "$ENV_FILE"
echo "== Configuración guardada en $ENV_FILE =="

# Iniciar server
echo "== Iniciando servidor con 'npm run dev' =="
npm run dev
