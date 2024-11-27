#!/bin/bash

mv /etc/psql.conf/pg_hba.conf /var/lib/postgresql/data/pg_hba.conf

psql -U postgres -c "CREATE DATABASE ${DB_GAME};"
psql -U postgres -c "CREATE USER ${DB_GAME_USER} WITH PASSWORD '${DB_GAME_PASSWORD}';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_GAME} TO ${DB_GAME_USER};"
psql -U postgres -c "ALTER DATABASE ${DB_GAME} OWNER TO ${DB_GAME_USER};"