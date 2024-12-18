#!/bin/bash

/bin/bash

openssl genpkey -algorithm RSA -out /keys/sjwt_private.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -pubout -in /keys/sjwt_private.pem -out /keys/sjwt_public.pem

pip install --upgrade pip --no-input
pip install -r ../requirements.txt --no-input
python3 manage.py makemigrations --no-input
python3 manage.py migrate --no-input

exec gunicorn auth_service.wsgi:application --bind 0.0.0.0:8003 --capture-output --access-logfile - --error-logfile -
