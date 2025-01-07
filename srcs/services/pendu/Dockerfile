FROM python:3.9

COPY pendu_service .
COPY ./conf/requirements.txt .
EXPOSE 8006

COPY /conf/start.sh .
RUN chmod +x start.sh


ENTRYPOINT [ "bash", "start.sh" ]
