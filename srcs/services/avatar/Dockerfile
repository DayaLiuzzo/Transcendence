FROM python:3.12.5-bullseye

ENV PYTHONUNBUFFERED=1

RUN adduser --system --no-create-home avatar_user
RUN apt-get update && apt-get install -y openssl

RUN pip install --upgrade pip --no-input
RUN --mount=type=bind,source=init/requirements.txt,target=/tmp/requirements.txt \
    pip install -r /tmp/requirements.txt

RUN mkdir -p /service_code/
RUN mkdir -p /init/
RUN mkdir -p /var/www/media/

COPY init/start.sh /init/start.sh
RUN chmod +x /init/start.sh

COPY avatar_service/ /service_code/

RUN chown -R avatar_user /service_code/
# USER avatar_user

WORKDIR /service_code
EXPOSE 8005
ENTRYPOINT [ "/init/start.sh" ]
