#!/bin/bash

python3 manage.py makemigrations --no-input
python3 manage.py migrate --no-input
python3 manage.py generate_service_tokens

exec gunicorn auth_service.wsgi:application --bind 0.0.0.0:8443 --reload
