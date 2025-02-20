#!/bin/bash

SERVICES=("AUTH" "GAME" "USERS" "API_GATEWAY" "TOURNAMENT" "AVATAR" "ROOMS")

ENV_FILE="srcs/.env"

generate_secret_key() {
   openssl rand -base64 50 | tr -d '\n'
}

touch "$ENV_FILE"

for SERVICE in "${SERVICES[@]}"; do
    SECRET_KEY_VAR="${SERVICE}_SECRET_KEY"

    # Check if the key already exists
    if grep -q "^$SECRET_KEY_VAR=" "$ENV_FILE"; then
        echo "$SECRET_KEY_VAR already exists in $ENV_FILE, skipping..."
    else
        NEW_SECRET_KEY=$(generate_secret_key)
        echo "$SECRET_KEY_VAR=\"$NEW_SECRET_KEY\"" >> "$ENV_FILE"
        echo "Generated secret for $SERVICE."
    fi
done

echo "✅ All secrets generated and stored in $ENV_FILE!"

