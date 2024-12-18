FROM python:3.9

RUN apt-get update && apt-get install -y openssl
RUN mkdir -p /keys

COPY users_service .
COPY ./conf/requirements.txt .
EXPOSE 8000

COPY /conf/start.sh .
RUN chmod +x start.sh


ENTRYPOINT [ "bash", "start.sh" ]
