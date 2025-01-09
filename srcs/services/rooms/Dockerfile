FROM python:3.9

ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y openssl


RUN mkdir -p /service_code
RUN mkdir -p /init
RUN mkdir -p /certs

COPY init/* /init 

RUN chmod +x /init/start.sh

WORKDIR /service_code

EXPOSE 8005
ENTRYPOINT [ "bash", "/init/start.sh" ]
