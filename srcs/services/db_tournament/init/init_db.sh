#!/bin/bash

mv /etc/psql.conf/pg_hba.conf /var/lib/postgresql/data/pg_hba.conf

psql -U postgres -c "CREATE DATABASE ${DB_TOURNAMENT};"
psql -U postgres -c "CREATE USER ${DB_TOURNAMENT_USER} WITH PASSWORD '${DB_TOURNAMENT_PASSWORD}';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_TOURNAMENT} TO ${DB_TOURNAMENT_USER};"
psql -U postgres -c "ALTER DATABASE ${DB_TOURNAMENT} OWNER TO ${DB_TOURNAMENT_USER};"