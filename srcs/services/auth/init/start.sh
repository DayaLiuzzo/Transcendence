#!/bin/bash

/bin/bash

openssl genpkey -algorithm RSA -out /private_key/sjwt_private.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -pubout -in /private_key/sjwt_private.pem -out /keys/sjwt_public.pem


pip install --upgrade pip --no-input
pip install -r /init/requirements.txt --no-input
python3 manage.py makemigrations --no-input
python3 manage.py migrate --no-input
python3 manage.py generate_service_tokens

exec gunicorn auth_service.wsgi:application --bind 0.0.0.0:8443 --reload
