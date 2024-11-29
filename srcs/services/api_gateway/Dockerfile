FROM python:3.9


COPY api_gateway_service .
COPY ./conf/requirements.txt .

COPY /conf/start.sh .
RUN chmod +x start.sh

EXPOSE 8002 

ENTRYPOINT [ "bash", "start.sh" ]


