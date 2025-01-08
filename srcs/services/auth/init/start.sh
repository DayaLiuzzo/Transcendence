#!/bin/bash

/bin/bash

openssl genpkey -algorithm RSA -out /keys/sjwt_private.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -pubout -in /keys/sjwt_private.pem -out /keys/sjwt_public.pem

# if [ ! -f $SSL_CERT_PATH/server.crt ] || [ ! -f $SSL_KEY_PATH/server.key ]; then
#   echo "Generating SSL certificates..."
#   openssl genpkey -algorithm RSA -out $SSL_KEY_PATH/server.key
#   openssl req -new -key $SSL_KEY_PATH/server.key -out $SSL_KEY_PATH/server.csr -subj "/CN=localhost"
#   openssl x509 -req -in $SSL_KEY_PATH/server.csr -signkey $SSL_KEY_PATH/server.key -out $SSL_CERT_PATH/server.crt

#   echo "SSL certificates generated."
# fi

pip install --upgrade pip --no-input
pip install -r /init/requirements.txt --no-input
python3 manage.py makemigrations --no-input
python3 manage.py migrate --no-input
python3 manage.py generate_service_tokens

exec gunicorn auth_service.wsgi:application --bind 0.0.0.0:8003 --capture-output --access-logfile - --error-logfile -
