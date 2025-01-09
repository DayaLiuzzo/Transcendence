/bin/bash

pip install --upgrade pip --no-input
pip install -r /init/requirements.txt --no-input
python3 manage.py makemigrations --noinput
python3 manage.py migrate --noinput

exec gunicorn rooms_service.wsgi:application --bind 0.0.0.0:8005
