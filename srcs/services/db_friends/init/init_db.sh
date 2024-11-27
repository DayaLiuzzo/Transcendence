#!/bin/bash

mv /etc/psql.conf/pg_hba.conf /var/lib/postgresql/data/pg_hba.conf

psql -U postgres -c "CREATE DATABASE ${DB_FRIENDS};"
psql -U postgres -c "CREATE USER ${DB_FRIENDS_USER} WITH PASSWORD '${DB_FRIENDS_PASSWORD}';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_FRIENDS} TO ${DB_FRIENDS_USER};"
psql -U postgres -c "ALTER DATABASE ${DB_FRIENDS} OWNER TO ${DB_FRIENDS_USER};"