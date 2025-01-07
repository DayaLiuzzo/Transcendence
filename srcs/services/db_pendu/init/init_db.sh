#!/bin/bash

mv /etc/psql.conf/pg_hba.conf /var/lib/postgresql/data/pg_hba.conf

psql -U postgres -c "CREATE DATABASE ${DB_PENDU};"
psql -U postgres -c "CREATE USER ${DB_PENDU_USER} WITH PASSWORD '${DB_PENDU_PASSWORD}';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_PENDU} TO ${DB_PENDU_USER};"
psql -U postgres -c "ALTER DATABASE ${DB_PENDU} OWNER TO ${DB_PENDU_USER};"