/bin/bash

pip install --upgrade pip --no-input
pip install -r ../requirements.txt --no-input
python3 manage.py makemigrations --no-input
python3 manage.py migrate --no-input

exec gunicorn auth_service.wsgi:application --bind 0.0.0.0:8003 --capture-output --access-logfile - --error-logfile -
