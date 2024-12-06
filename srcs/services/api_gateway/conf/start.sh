/bin/bash

pip install --upgrade pip --no-input
pip install -r ../requirements.txt --no-input
pip install django-cors-headers --noinput
python3 manage.py makemigrations --noinput
python3 manage.py migrate --noinput

exec gunicorn api_gateway_service.wsgi:application --bind 0.0.0.0:8002
