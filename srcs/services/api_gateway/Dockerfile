FROM python:3.12.5-bullseye

ENV PYTHONUNBUFFERED=1

RUN adduser --system --no-create-home api_gateway_user
RUN apt-get update && apt-get install -y openssl

RUN pip install --upgrade pip --no-input
RUN --mount=type=bind,source=init/requirements.txt,target=/tmp/requirements.txt \
    pip install -r /tmp/requirements.txt

RUN mkdir -p /service_code/
RUN mkdir -p /init/

COPY init/start.sh /init/start.sh
RUN chmod +x /init/start.sh

COPY api_gateway_service/ /service_code/

RUN chown -R api_gateway_user /service_code/
USER api_gateway_user

WORKDIR /service_code/
EXPOSE 8443
ENTRYPOINT [ "/init/start.sh" ]
