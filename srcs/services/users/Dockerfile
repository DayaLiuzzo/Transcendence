FROM python:3.12.5

ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y openssl

RUN mkdir -p /keys
RUN mkdir -p /service_code
RUN mkdir -p /init
RUN mkdir -p /certs
COPY certs/* /certs

COPY init/* /init 

RUN chmod +x /init/start.sh

RUN mkdir -p /usr/local/share/ca-certificates

RUN cp /certs/ca.crt /usr/local/share/ca-certificates/ca.crt

RUN update-ca-certificates

WORKDIR /service_code

EXPOSE 8443
ENTRYPOINT [ "bash", "/init/start.sh" ]