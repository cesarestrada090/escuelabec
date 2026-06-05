#!/bin/bash
# ════════════════════════════════════════════════════════════════
# CRM Escuela BEC - Script de inicio local
# ════════════════════════════════════════════════════════════════

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BLUE}  CRM Escuela BEC - Iniciando servicios...  ${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}"

echo -e "\n${GREEN}▶ Levantando MySQL...${NC}"
docker-compose up -d mysql

echo -e "${GREEN}▶ Esperando que MySQL esté listo...${NC}"
sleep 10

echo -e "${GREEN}▶ Ejecutando schema y datos...${NC}"
cat backend/sql/01-schema.sql | docker exec -i crm-mysql mysql -u root -p123456789 crm_escuelabec
cat backend/sql/02-master-data.sql | docker exec -i crm-mysql mysql -u root -p123456789 crm_escuelabec

echo -e "${GREEN}▶ Levantando todos los servicios...${NC}"
docker-compose up -d

echo -e "\n${GREEN}✅ Todo listo!${NC}"
echo -e "  API:     http://localhost:8080/api/health"
echo -e "  Swagger: http://localhost:8080/swagger-ui.html"
echo -e "  Frontend:http://localhost:4200"
echo -e "  Adminer: http://localhost:8081"
