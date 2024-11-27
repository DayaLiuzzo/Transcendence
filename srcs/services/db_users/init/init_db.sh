#!/bin/bash

mv /etc/psql.conf/pg_hba.conf /var/lib/postgresql/data/pg_hba.conf

psql -U postgres -c "CREATE DATABASE ${DB_USERS};"
psql -U postgres -c "CREATE USER ${DB_USERS_USER} WITH PASSWORD '${DB_USERS_PASSWORD}';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_USERS} TO ${DB_USERS_USER};"
psql -U postgres -c "ALTER DATABASE ${DB_USERS} OWNER TO ${DB_USERS_USER};"