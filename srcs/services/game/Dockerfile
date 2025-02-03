FROM python:3.12.5-bullseye

ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y openssl

RUN mkdir -p /keys
RUN mkdir -p /service_code
RUN mkdir -p /init
RUN mkdir -p /certs
COPY certs/* /certs

COPY init/* /init 


RUN mkdir -p usr/local/share/ca-certificates
RUN cp /certs/ca.crt /usr/local/share/ca-certificates/ca.crt

RUN update-ca-certificates

RUN chmod +x /init/start.sh

WORKDIR /service_code

RUN cat /certs/ca.crt >> /etc/ssl/certs/ca-certificates.crt
ENV REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt

EXPOSE 8443
ENTRYPOINT [ "bash", "/init/start.sh" ]
