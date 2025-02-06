#!/bin/bash

mv /etc/psql.conf/pg_hba.conf /var/lib/postgresql/data/pg_hba.conf

psql -U postgres -c "CREATE DATABASE ${DB_ROOMS};"
psql -U postgres -c "CREATE USER ${DB_ROOMS_USER} WITH PASSWORD '${DB_ROOMS_PASSWORD}';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_ROOMS} TO ${DB_ROOMS_USER};"
psql -U postgres -c "ALTER DATABASE ${DB_ROOMS} OWNER TO ${DB_ROOMS_USER};"
psql -U postgres -c "ALTER USER ${DB_ROOMS_USER} CREATEDB;"