#!/bin/bash

echo "Configurando entorno para el robot..."

# Crear entorno virtual si no existe
if [ ! -d "venv" ]; then
    echo "Creando entorno virtual..."
    python3 -m venv venv

    # Activar entorno virtual
    echo "Activando entorno virtual..."
    source venv/bin/activate || { echo "ERROR: No se pudo activar el entorno virtual"; exit 1; }

    # Instalar requirements.txt
    echo "Instalando dependencias..."
    pip install --upgrade pip
    pip3 install -r requirements.txt || { echo "ERROR: No se pudieron instalar los paquetes"; exit 1; }
else
    # Activar entorno virtual
    echo "Activando entorno virtual..."
    source venv/bin/activate || { echo "ERROR: No se pudo activar el entorno virtual"; exit 1; }
fi

echo "Instalación completa. Ejecutando..."

exec python3 main.py