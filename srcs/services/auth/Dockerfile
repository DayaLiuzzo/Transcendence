FROM python:3.9

ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y openssl

RUN mkdir -p /keys

COPY auth_service .

COPY ./conf/requirements.txt .

COPY /conf/start.sh .
RUN chmod +x start.sh



EXPOSE 8003
ENTRYPOINT [ "bash", "start.sh" ]
