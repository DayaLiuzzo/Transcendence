FROM python:3.9

COPY app_usermanagement .
COPY ./conf/requirements.txt .

COPY /conf/start.sh .
RUN chmod +x start.sh

EXPOSE 8000

ENTRYPOINT [ "bash", "start.sh" ]