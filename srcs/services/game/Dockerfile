FROM python:3.9

COPY game_service .
COPY ./conf/requirements.txt .
EXPOSE 8001

COPY /conf/start.sh .
RUN chmod +x start.sh


ENTRYPOINT [ "bash", "start.sh" ]
