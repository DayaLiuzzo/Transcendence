FROM python:3.9

COPY auth_app .
COPY ./conf/requirements.txt .
EXPOSE 8003

COPY /conf/start.sh .
RUN chmod +x start.sh


ENTRYPOINT [ "bash", "start.sh" ]
