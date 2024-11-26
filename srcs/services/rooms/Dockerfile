FROM python:3.9

COPY rooms_app .
COPY ./conf/requirements.txt .

COPY /conf/start.sh .
RUN chmod +x start.sh

EXPOSE 8005

ENTRYPOINT [ "bash", "start.sh" ]