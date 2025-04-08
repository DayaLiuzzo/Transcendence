FROM nginx:1.24


RUN mkdir -p /etc/nginx/ssl
RUN mkdir -p /certs
RUN mkdir -p /var/www/media

COPY ./certs/* /certs
COPY ./conf/nginx.conf /etc/nginx/nginx.conf



ENTRYPOINT ["nginx", "-g", "daemon off;"]
