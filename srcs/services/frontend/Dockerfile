FROM nginx:1.24


RUN mkdir -p /etc/nginx/ssl
RUN mkdir -p /certs
RUN mkdir -p /var/www/media

COPY ./certs/* /certs

# RUN openssl req -x509 -nodes -days 365 \
# 	-newkey rsa:2048 \
# 	-keyout /etc/ssl/private/madavid.key \
# 	-out /etc/ssl/certs/madavid.42.fr.crt \
# 	-subj "/C=FR/ST=Paris/L=Paris/O=42_Paris/CN=["${DOMAIN}"](http://"${HOST}".42.fr/)/UID="${HOST}

COPY ./conf/nginx.conf /etc/nginx/nginx.conf



ENTRYPOINT ["nginx", "-g", "daemon off;"]
