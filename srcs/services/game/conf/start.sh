/bin/bash

pip install --upgrade pip --no-input
pip install -r ../requirements.txt --no-input
python3 manage.py makemigrations --noinput
python3 manage.py migrate --noinput
apt-get update
apt-get install -y redis-server
redis-server --appendonly yes --daemonize yes

exec daphne -b 0.0.0.0 -p 8001 game_service.asgi:application
