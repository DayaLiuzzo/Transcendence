all: start 

start:
	docker compose -f srcs/docker-compose.yml up --build -d

re: clean all

stop:
	docker compose -f srcs/docker-compose.yml down 

# enter_mariadb:
# 	docker exec -it mariadb bash

# enter_wordpress:
# 	docker exec -it wordpress sh

# enter_nginx:
# 	docker exec -it nginx bash

logs:
	docker compose -f srcs/docker-compose.yml logs

# create_dirs:
# 	@echo "Creating necessary directories..."
# 	@if [ ! -d /home/dliuzzo/data/wordpress ]; then \
# 		mkdir -p /home/dliuzzo/data/wordpress; \
# 	fi

# 	@if [ ! -d /home/dliuzzo/data/mariadb ]; then \
# 		mkdir -p /home/dliuzzo/data/mariadb; \
# 	fi

# 	@echo "Directories created."

clean:
	# @echo "Cleaning up volume stored at /home/dliuzzo/data..."
	@-docker rmi $$(docker images -q) 2>/dev/null
	docker image prune -f
	docker container prune -f
	# docker volume prune -f
	docker network prune -f
	docker system prune -f --volumes
	rm -rf $(data)
	# @rm -rf /home/dliuzzo/data/*
	@echo "Cleanup completed."
