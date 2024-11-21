all: up 

up:
	docker compose -f srcs/docker-compose.yml up --build -d

stop:
	docker compose -f srcs/docker-compose.yml stop 

start:
	docker compose -f srcs/docker-compose.yml start

restart:
	docker compose -f srcs/docker-compose.yml restart

down:
	docker compose -f srcs/docker-compose.yml down

clean: down
	@-docker rmi $$(docker images -q) 2>/dev/null
	docker image prune -f
	docker container prune -f
	docker network prune -f
	docker system prune -af
	@echo "Cleanup completed."

re: clean all

########################################################################
######### Execute individual dockers with interactive terminal #########
########################################################################

enter_frontend:
	docker exec -it frontend bash

enter_user-management:
	docker exec -it user-management sh

enter_game:
	docker exec -it game bash

enter_auth:
	docker exec -it auth sh

enter_friends:
	docker exec -it friends bash

enter_rooms:
	docker exec -it rooms bash

########################################################################
########################### Get service logs ###########################
########################################################################

logs:
	docker compose -f srcs/docker-compose.yml logs

logs_frontend:
	docker logs frontend

logs_user-management:
	docker logs user-management

logs_game:
	docker logs game

logs_auth:
	docker logs auth

logs_friends:
	docker logs friends

logs_rooms:
	docker logs rooms

########################################################################
######################## Get status and all logs #######################
########################################################################

status	: logs ; docker ps -a

########################################################################
########################## Manage directories ##########################
########################################################################


########################################################################
################################ .PHONY ################################
########################################################################

.PHONY: all up stop start restart down clean re enter_frontend enter_user-management enter_game enter_auth enter_friends enter_rooms logs logs_frontend logs_user-management logs_game logs_auth logs_friends logs_rooms status 