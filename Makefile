.PHONY: up down restart logs db-shell api-health

up:
	docker-compose up -d

down:
	docker-compose down

restart:
	docker-compose restart backend

logs:
	docker logs crm-backend -f

db-shell:
	docker exec -it crm-mysql mysql -u root -p123456789 crm_escuelabec

api-health:
	curl -s http://localhost:8080/api/health | python3 -m json.tool

init-db:
	cat backend/sql/01-schema.sql | docker exec -i crm-mysql mysql -u root -p123456789 crm_escuelabec
	cat backend/sql/02-master-data.sql | docker exec -i crm-mysql mysql -u root -p123456789 crm_escuelabec

build-backend:
	docker-compose build backend

start: up
	@echo "Esperando MySQL..."
	@sleep 10
	@$(MAKE) init-db
	@echo "✅ CRM listo en http://localhost:8080"
