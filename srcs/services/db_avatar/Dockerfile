FROM postgres:16.4

RUN mkdir -p /docker-entrypoint-initdb
RUN mkdir -p /etc/psql.conf


COPY ./init/init_db.sh /docker-entrypoint-initdb.d/init_db.sh
COPY ./conf/pg_hba.conf /etc/psql.conf/pg_hba.conf

RUN chmod 777 /docker-entrypoint-initdb.d/init_db.sh
RUN rm -rf /var/lib/postgresql/data/*


RUN chown -R postgres:postgres /etc/psql.conf
