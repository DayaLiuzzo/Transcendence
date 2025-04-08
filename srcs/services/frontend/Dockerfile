FROM nginx:1.24

RUN mkdir -p /etc/nginx/ssl/
RUN mkdir -p /certs/
RUN mkdir -p /var/www/media/

COPY ./certs/* /certs
RUN chmod -R +r /certs/

COPY ./conf/nginx.conf /etc/nginx/nginx.conf
COPY public/ /usr/share/nginx/html/

WORKDIR /usr/share/nginx/html/
ENTRYPOINT ["nginx", "-g", "daemon off;"]
