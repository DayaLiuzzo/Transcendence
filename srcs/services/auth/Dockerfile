FROM python:3.12.5-bullseye

ENV PYTHONUNBUFFERED=1

RUN adduser --system --no-create-home auth_user
RUN apt-get update && apt-get install -y openssl

RUN pip install --upgrade pip --no-input
RUN --mount=type=bind,source=init/requirements.txt,target=/tmp/requirements.txt \
    pip install -r /tmp/requirements.txt

RUN mkdir -p /keys/
RUN mkdir -p /private_key/
RUN mkdir -p /service_code/
RUN mkdir -p /init/

RUN openssl genpkey -algorithm RSA -out /private_key/sjwt_private.pem -pkeyopt rsa_keygen_bits:2048 && \
	openssl rsa -pubout -in /private_key/sjwt_private.pem -out /keys/sjwt_public.pem
RUN chmod -R +r /keys/
RUN chmod -R +r /private_key/

COPY init/start.sh /init/start.sh
RUN chmod +x /init/start.sh

COPY auth_service/ /service_code/

RUN chown -R auth_user /service_code/
USER auth_user

WORKDIR /service_code
EXPOSE 8443
ENTRYPOINT [ "/init/start.sh" ]
