/bin/bash

pip install --upgrade pip --no-input
pip install -r /init/requirements.txt --no-input
pip install channels
pip install daphne
python3 manage.py makemigrations --noinput
python3 manage.py migrate --noinput

exec daphne -b 0.0.0.0 -p 8443 game_service.asgi:application
#si je veux utiliser --reload, je peux pas le faire avec daphne donc je dois changer pour uvicorn