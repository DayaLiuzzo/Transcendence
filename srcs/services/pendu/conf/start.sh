/bin/bash

pip install --upgrade pip --no-input
pip install -r ../requirements.txt --no-input
pip install channels
pip install daphne
pip install requests
python3 manage.py makemigrations --noinput
python3 manage.py migrate --noinput

exec daphne -b 0.0.0.0 -p 8006 pendu_service.asgi:application
