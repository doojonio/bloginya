# Makefile for docker-compose development

# Variables
COMPOSE_FILE = docker-compose.yml
COMPOSE = docker-compose -f $(COMPOSE_FILE)

# Targets
.PHONY: all up down build rebuild logs ps shell

all: up

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

build:
	$(COMPOSE) build

rebuild:
	$(COMPOSE) build --no-cache

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

shell:
	$(COMPOSE) exec $(service) /bin/bash

# Help
help:
	@echo "Usage: make [target]"
	@echo "Targets:"
	@echo "  all       - (default) same as up"
	@echo "  up        - Start all services in detached mode"
	@echo "  down      - Stop all services"
	@echo "  build     - Build all services"
	@echo "  rebuild   - Rebuild all services without cache"
	@echo "  logs      - View the logs of all services"
	@echo "  ps        - See the status of the services"
	@echo "  shell     - Get a shell into a service. Usage: make shell service=[service_name]"
	@echo "  help      - Show this help message"

