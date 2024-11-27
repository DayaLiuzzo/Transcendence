FROM python:3.9


COPY friends_service .
COPY ./conf/requirements.txt .

COPY /conf/start.sh .
RUN chmod +x start.sh

EXPOSE 8004 

ENTRYPOINT [ "bash", "start.sh" ]


