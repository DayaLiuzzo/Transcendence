#!/bin/bash

mv /etc/psql.conf/pg_hba.conf /var/lib/postgresql/data/pg_hba.conf

psql -U postgres -c "CREATE DATABASE ${DB_AVATAR};"
psql -U postgres -c "CREATE USER ${DB_AVATAR_USER} WITH PASSWORD '${DB_AVATAR_PASSWORD}';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_AVATAR} TO ${DB_AVATAR_USER};"
psql -U postgres -c "ALTER DATABASE ${DB_AVATAR} OWNER TO ${DB_AVATAR_USER};"
psql -U postgres -c "ALTER USER ${DB_AVATAR_USER} CREATEDB;"