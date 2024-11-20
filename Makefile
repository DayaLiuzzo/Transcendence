SRCS = ./srcs/services/frontend/Dockerfile \
		./srcs/services/user-management/Dockerfile

all : 
	 docker compose -f ./srcs/docker-compose.yml up -d --build

# create_volumes_repo :
						
# 						@if [ ! -d /home/madavid/data/ ]; \
# 						then \
# 							mkdir /home/madavid/data; \
# 						fi ; \
# 						if [ ! -d /home/madavid/data/wordpress ]; \
# 						then \
# 							mkdir /home/madavid/data/wordpress; \
# 						fi ; \
# 						if [ ! -d /home/madavid/data/mariadb ]; \
# 						then \
# 							mkdir /home/madavid/data/mariadb; \
# 						fi ; 

stop :
	docker compose -f ./srcs/docker-compose.yml stop

start :
	docker compose -f ./srcs/docker-compose.yml start

restart :
	docker compose -f ./srcs/docker-compose.yml restart

down	: ${SRCS}
			docker compose -f ./srcs/docker-compose.yml down 

status	:
	docker ps -a ; docker logs nginx ; docker logs wordpress ; docker logs mariadb

clean : down
				
				@if [ "docker images nginx" ]; \
				then \
					docker rmi -f nginx; \
				fi ; \
				if [ "docker images mariadb" ]; \
				then \
					docker rmi -f mariadb; \
				fi ; \
				if [ "docker images wordpress" ]; \
				then \
					docker rmi -f wordpress; \
				fi ; \
				if [ "docker volume ls -f name=srcs_mariadb" ]; \
				then \
					docker volume rm -f mariadb; \
				fi ; \
				if [ "docker volume ls -f name=srcs_wordpress" ]; \
				then \
					docker volume rm -f wordpress; \
				fi ; \
				docker system prune -af;

				rm -rf /home/madavid/data

re : clean all

.PHONY: all create_volumes_repo down clean re status 