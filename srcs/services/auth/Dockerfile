FROM python:3.12.5-bullseye

ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y openssl

RUN mkdir -p /keys
RUN mkdir -p /private_key
RUN mkdir -p /service_code
RUN mkdir -p /init
RUN mkdir -p /certs

COPY init/* /init 
COPY certs/* /certs

RUN chmod +x /init/start.sh
RUN cp /certs/ca.crt /usr/local/share/ca-certificates/ca.crt
RUN update-ca-certificates

WORKDIR /service_code

RUN cat /certs/ca.crt >>/etc/ssl/certs/ca-certificates.crt
ENV REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt

EXPOSE 8443
ENTRYPOINT [ "bash", "/init/start.sh" ]
