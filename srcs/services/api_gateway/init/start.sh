#!/bin/bash

# python3 manage.py makemigrations --noinput
# python3 manage.py migrate --noinput

exec gunicorn api_gateway_service.wsgi:application --bind 0.0.0.0:8443 --reload
