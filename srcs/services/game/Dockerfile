FROM python:3.9


COPY app_game .
COPY ./conf/requirements.txt .

COPY /conf/start.sh .
RUN chmod +x start.sh

EXPOSE 8001

ENTRYPOINT [ "bash", "start.sh" ]