#!/bin/bash

mv /etc/psql.conf/pg_hba.conf /var/lib/postgresql/data/pg_hba.conf

psql -U postgres -c "CREATE DATABASE ${DB_AUTH};"
psql -U postgres -c "CREATE USER ${DB_AUTH_USER} WITH PASSWORD '${DB_AUTH_PASSWORD}';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_AUTH} TO ${DB_AUTH_USER};"
psql -U postgres -c "ALTER DATABASE ${DB_AUTH} OWNER TO ${DB_AUTH_USER};"
psql -U postgres -c "ALTER USER ${DB_AUTH_USER} CREATEDB;"