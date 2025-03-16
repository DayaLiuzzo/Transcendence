FRONTEND_SERVICE		:=	frontend

AUTH_SERVICE			:=	auth
DB_AUTH_SERVICE			:=	db_auth

USERS_SERVICE			:=	users
DB_USERS_SERVICE		:=	db_users

GAME_SERVICE			:=	game
DB_GAME_SERVICE			:=	db_game

AVATAR_SERVICE			:=	avatar
DB_AVATAR_SERVICE		:=	db_avatart

API_GATEWAY_SERVICE		:=	api_gateway

ROOMS_SERVICE			:=	rooms
DB_ROOMS_SERVICE		:=	db_rooms

TOURNAMENT_SERVICE		:=	tournament
DB_TOURNAMENT_SERVICE	:=	db_tournament

all: check_certs up 

up:
	docker compose -f srcs/docker-compose.yml up --build --watch --remove-orphans

stop:
	docker compose -f srcs/docker-compose.yml stop 

start:
	docker compose -f srcs/docker-compose.yml start

restart:
	docker compose -f srcs/docker-compose.yml restart

down:
	docker compose -f srcs/docker-compose.yml down --volumes

.PHONY: all up stop start restart down

########################################################################
######### Execute individual dockers with interactive terminal #########
########################################################################

enter_$(FRONTEND_SERVICE)		\
enter_$(AUTH_SERVICE)			\
enter_$(USERS_SERVICE)			\
enter_$(GAME_SERVICE)			\
enter_$(AVATAR_SERVICE)			\
enter_$(API_GATEWAY_SERVICE)	\
enter_$(ROOMS_SERVICE)			\
enter_$(TOURNAMENT_SERVICE)		\
enter_$(DB_AUTH_SERVICE)		\
enter_$(DB_AVATAR_SERVICE)		\
enter_$(DB_GAME_SERVICE)		\
enter_$(DB_ROOMS_SERVICE)		\
enter_$(DB_TOURNAMENT_SERVICE)	\
enter_$(DB_USERS_SERVICE)		:
	docker exec -it $(patsubst enter_%,%,$@) bash


.PHONY:	\
	enter_$(FRONTEND_SERVICE)		\
	enter_$(AUTH_SERVICE)			\
	enter_$(USERS_SERVICE)			\
	enter_$(GAME_SERVICE)			\
	enter_$(AVATAR_SERVICE)			\
	enter_$(API_GATEWAY_SERVICE)	\
	enter_$(ROOMS_SERVICE)			\
	enter_$(TOURNAMENT_SERVICE) 	\
	enter_$(DB_AUTH_SERVICE)		\
	enter_$(DB_AVATAR_SERVICE)		\
	enter_$(DB_GAME_SERVICE)		\
	enter_$(DB_ROOMS_SERVICE)		\
	enter_$(DB_TOURNAMENT_SERVICE)	\
	enter_$(DB_USERS_SERVICE)		\

########################################################################
########################### Recreate container #########################
########################################################################

$(FRONTEND_SERVICE)			\
$(AUTH_SERVICE)				\
$(USERS_SERVICE)			\
$(GAME_SERVICE)				\
$(AVATAR_SERVICE)			\
$(API_GATEWAY_SERVICE)		\
$(ROOMS_SERVICE)			\
$(TOURNAMENT_SERVICE)		\
$(DB_AUTH_SERVICE)			\
$(DB_AVATAR_SERVICE)		\
$(DB_GAME_SERVICE)			\
$(DB_ROOMS_SERVICE)			\
$(DB_TOURNAMENT_SERVICE)	\
$(DB_USERS_SERVICE)			:
	docker compose -f srcs/docker-compose.yml up --force-recreate --build -d $@

########################################################################
########################### Get service logs ###########################
########################################################################

logs:
	docker compose -f srcs/docker-compose.yml logs

logs_$(FRONTEND_SERVICE):
	docker compose -f srcs/docker-compose.yml logs $(FRONTEND_SERVICE)

logs_$(AUTH_SERVICE):
	docker compose -f srcs/docker-compose.yml logs $(AUTH_SERVICE)

logs_$(USERS_SERVICE):
	docker compose -f srcs/docker-compose.yml logs $(USERS_SERVICE)

logs_$(GAME_SERVICE):
	docker compose -f srcs/docker-compose.yml logs $(GAME_SERVICE)

logs_$(AVATAR_SERVICE):
	docker compose -f srcs/docker-compose.yml logs $(AVATAR_SERVICE)

logs_$(API_GATEWAY_SERVICE):
	docker compose -f srcs/docker-compose.yml logs $(API_GATEWAY_SERVICE)

logs_$(ROOMS_SERVICE):
	docker compose -f srcs/docker-compose.yml logs $(ROOMS_SERVICE)

logs_$(TOURNAMENT_SERVICE):
	docker compose -f srcs/docker-compose.yml logs $(TOURNAMENT_SERVICE) 

logs_$(DB_AUTH_SERVICE):
	docker compose -f srcs/docker-compose.yml logs $(DB_AUTH_SERVICE)

logs_$(DB_AVATAR_SERVICE):
	docker compose -f srcs/docker-compose.yml logs $(DB_AVATAR_SERVICE)

logs_$(DB_GAME_SERVICE):
	docker compose -f srcs/docker-compose.yml logs $(DB_GAME_SERVICE)

logs_$(DB_ROOMS_SERVICE):
	docker compose -f srcs/docker-compose.yml logs $(DB_AUTH_SERVICE)

logs_$(DB_TOURNAMENT_SERVICE):
	docker compose -f srcs/docker-compose.yml logs $(DB_TOURNAMENT_SERVICE)

logs_$(DB_USERS_SERVICE):
	docker compose -f srcs/docker-compose.yml logs $(DB_USERS_SERVICE)

.PHONY:	\
	logs							\
	logs_$(FRONTEND_SERVICE)		\
	logs_$(AUTH_SERVICE)			\
	logs_$(USERS_SERVICE)			\
	logs_$(GAME_SERVICE)			\
	logs_$(AVATAR_SERVICE)			\
	logs_$(API_GATEWAY_SERVICE)		\
	logs_$(ROOMS_SERVICE)			\
	logs_$(TOURNAMENT_SERVICE) 		\
	logs_$(DB_AUTH_SERVICE)			\
	logs_$(DB_AVATAR_SERVICE)		\
	logs_$(DB_GAME_SERVICE)			\
	logs_$(DB_ROOMS_SERVICE)		\
	logs_$(DB_TOURNAMENT_SERVICE)	\
	logs_$(DB_USERS_SERVICE)		\

########################################################################
######################## Get status and all logs #######################
########################################################################

status: logs
	docker ps -a

.PHONY: status

#########################################################################
############################ CERTS ###################################
#########################################################################

check_certs:
	if [ ! -f ca.crt ]; then \
		./init_project.sh; \
	else \
		echo "Certs already up"; \
	fi

.PHONY: check_certs

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
		rm -f srcs/services/game/game_service/service_connector/migrations/000*
	rm -f srcs/services/rooms/rooms_service/rooms_app/migrations/000*
	rm -f srcs/services/tournament/tournament_service/tournament_app/migrations/000*
	rm -f srcs/services/users/users_service/users_app/migrations/000*
	rm -f srcs/services/users/users_service/service_connector/migrations/000*	
	rm -f srcs/services/avatar/avatar_service/avatar_app/migrations/000*
	rm -f srcs/services/avatar/avatar_service/service_connector/migrations/000*	
	rm -rf srcs/services/avatar_media/users_avatars/*
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
	rm -rf srcs/services/tournament/certs
	rm -rf srcs/services/users/certs
	rm -rf srcs/services/frontend/certs
	rm -rf srcs/services/avatar/certs
	docker builder prune -af

clean: down clean_images clean_migration clean_cache clean_volumes clean_containers clean_network clean_certs

re: clean all

.PHONY:	\
	clean_cache			\
	clean_migration		\
	clean_images		\
	clean_volumes		\
	clean_containers	\
	clean_network		\
	clean_certs			\
	clean				\
	re					\

########################################################################
########################## Manage directories ##########################
########################################################################


