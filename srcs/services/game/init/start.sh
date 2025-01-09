/bin/bash

pip install --upgrade pip --no-input
pip install -r /init/requirements.txt --no-input
pip install channels
pip install daphne
python3 manage.py makemigrations --noinput
python3 manage.py migrate --noinput

exec daphne -b 0.0.0.0 -p 8001 game_service.asgi:application
