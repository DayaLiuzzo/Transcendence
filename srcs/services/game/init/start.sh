#!/bin/bash

pip install --upgrade pip --no-input
pip install -r /init/requirements.txt --no-input
pip install channels
pip install uvicorn[standard]
python3 manage.py makemigrations --noinput
python3 manage.py migrate --noinput

exec uvicorn game_service.asgi:application --host 0.0.0.0 --port 8443 --reload
