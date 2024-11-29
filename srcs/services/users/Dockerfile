FROM python:3.9


COPY users_service .
COPY ./conf/requirements.txt .
EXPOSE 8005

COPY /conf/start.sh .
RUN chmod +x start.sh


ENTRYPOINT [ "bash", "start.sh" ]
