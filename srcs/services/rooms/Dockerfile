FROM python:3.12.5-bullseye

ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y openssl

RUN mkdir -p /keys
RUN mkdir -p /service_code
RUN mkdir -p /init

COPY init/* /init 

RUN chmod +x /init/start.sh

WORKDIR /service_code

EXPOSE 8443
ENTRYPOINT [ "bash", "/init/start.sh" ]
