FROM python:3.12.5-bullseye

ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y openssl


RUN mkdir -p /service_code
RUN mkdir -p /init
RUN mkdir -p /var/www/media

COPY init/* /init 

RUN chmod +x /init/start.sh

WORKDIR /service_code

EXPOSE 8005
ENTRYPOINT [ "bash", "/init/start.sh" ]
