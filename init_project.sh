#!/bin/bash

SERVICES=(
    "auth"
    "users"
    "api_gateway"
    "frontend"
    "game"
    "avatar"
    "rooms"
    "tournament"
)

BASE_PATH="./srcs/services"
CERTS_PATHS=()
for service in "${SERVICES[@]}"; do
    CERTS_PATHS+=("$BASE_PATH/$service/certs")
done

GEN_CSR="openssl req -new -newkey rsa:4096 -nodes -out"
GEN_CRT="openssl x509 -req -days 365000 -in"


# Generate Root CA certificate
openssl genrsa 4096 > ca.key
openssl req -new -x509 -nodes -days 365000 -key ca.key -out ca.crt -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=CA/UID=dliuzzo"

for cert_path in "${CERTS_PATHS[@]}"; do
    mkdir -p "$cert_path"
done


# Generate service certificates
for cert_path in "${CERTS_PATHS[@]}"; do
    SERVICE_NAME=$(basename "$cert_path")

    # Generate CSR and cert for each service
    $GEN_CSR "$cert_path/$SERVICE_NAME.csr" -keyout "$cert_path/$SERVICE_NAME.key" -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=$SERVICE_NAME/UID=dliuzzo"
    $GEN_CRT "$cert_path/$SERVICE_NAME.csr" -out "$cert_path/$SERVICE_NAME.crt" -CA ./ca.crt -CAkey ./ca.key
done

# Copy the CA certificate to all service directories
for cert_path in "${CERTS_PATHS[@]}"; do
    cp ./ca.crt "$cert_path/ca.crt"
done
