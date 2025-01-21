all: check_certs up 

up:
	docker compose -f srcs/docker-compose.yml up --build -d --remove-orphans

stop:
	docker compose -f srcs/docker-compose.yml stop 

start:
	docker compose -f srcs/docker-compose.yml start

restart:
	docker compose -f srcs/docker-compose.yml restart

down:
	docker compose -f srcs/docker-compose.yml down

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

enter_db_auth:
	docker exec -it db_auth sh

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


logs_rooms:
	docker logs rooms

########################################################################
######################## Get status and all logs #######################
########################################################################

status	: logs ; docker ps -a

#########################################################################
############################ CERTS ###################################
#########################################################################

check_certs:
	if [ ! -f ca.crt ]; then \
		./init_project.sh; \
	else \
		echo "Certs already up"; \
	fi

#########################################################################
############################ CLEANING ###################################
#########################################################################


clean_cache:
	@echo "Cleaning __pycache__"
	find . -name "__pycache__" -type d -exec rm -rf {} +

clean_migration:
	@echo "Cleaning Migrations."
	rm -f srcs/services/api_gateway/api_gateway_service/api_gateway_app/migrations/000*
	rm -f srcs/services/auth/auth_service/auth_app/migrations/000*
	rm -f srcs/services/friends/friends_service/friends_app/migrations/000*
	rm -f srcs/services/game/game_service/game_app/migrations/000*
	rm -f srcs/services/rooms/rooms_service/rooms_app/migrations/000*
	rm -f srcs/services/users/users_service/users_app/migrations/000*
	rm -f srcs/services/users/users_service/microservice_client/migrations/000*	
	@echo "Cleanup completed."

clean_images:
	@echo "Cleaning Images."
	@-if [ "$$(docker images -q)" != "" ]; then \
		docker rmi $$(docker images -q) 2>/dev/null; \
	else \
		echo "No images to remove."; \
	fi
	docker image prune -f
	@echo "Cleanup completed."
clean_volumes:
	@echo "Cleaning Volumes."
	@-if [ "$$(docker volume ls -q)" != "" ]; then \
		echo "Removing all Docker volumes..."; \
		docker volume rm $$(docker volume ls -q) 2>/dev/null; \
		echo "Volumes removed."; \
	else \
		echo "No Docker volumes to remove."; \
	fi
	@echo "Cleanup completed."
clean_containers:
	@echo "Cleaning Containers."
	docker container prune -f
	docker system prune -af
	@echo "Cleanup completed."

clean_network:
	@echo "Cleaning Network."
	docker network prune -f
	@echo "Cleanup completed."

clean_certs:
	@echo "Cleaning Certs"
	rm -f ca.crt 
	rm -f ca.key
	rm -rf srcs/services/api_gateway/certs
	rm -rf srcs/services/auth/certs
	rm -rf srcs/services/friends/certs
	rm -rf srcs/services/game/certs
	rm -rf srcs/services/rooms/certs
	rm -rf srcs/services/users/certs
	rm -rf srcs/services/frontend/certs



clean: down clean_images clean_migration clean_cache clean_volumes clean_containers clean_network clean_certs

re: clean all

########################################################################
########################## Manage directories ##########################
########################################################################


########################################################################
################################ .PHONY ################################
########################################################################

.PHONY: all up stop start restart down clean re enter_frontend enter_user-management enter_game enter_auth enter_friends enter_rooms logs logs_frontend logs_user-management logs_game logs_auth logs_friends logs_rooms status 