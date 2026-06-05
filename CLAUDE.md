# Instrucciones Claude Code - CRM Escuela BEC

## 🚨 REGLAS ABSOLUTAS

### 🔒 DOBLE CONFIRMACIÓN EN PRODUCCIÓN (NO NEGOCIABLE)
**ANTES de ejecutar CUALQUIER comando UPDATE o DELETE en producción:**
1. **PREGUNTAR al usuario explícitamente** qué va a hacer
2. **ESPERAR confirmación explícita** del usuario
3. **PREGUNTAR SEGUNDA VEZ** para confirmar
4. **ESPERAR segunda confirmación** del usuario
5. Solo entonces ejecutar el comando

**Esto aplica a:**
- ❌ `UPDATE` en MySQL producción
- ❌ `DELETE` en MySQL producción
- ❌ `DROP` cualquier cosa en producción
- ❌ `TRUNCATE` en producción
- ❌ Modificaciones de archivos en producción vía SSH
- ❌ Cualquier operación destructiva en producción

**NO es negociable. NO hay excepciones.**

### 🚫 PROHIBIDO ABSOLUTO - DEPLOY A PRODUCCIÓN SIN AUTORIZACIÓN
**ANTES de ejecutar deploy a producción:**
1. **PREGUNTAR al usuario explícitamente** si quiere hacer deploy
2. **ESPERAR confirmación explícita**
3. **MOSTRAR** qué cambios se van a deployar
4. Solo entonces ejecutar el deploy

### Base de Datos (CRÍTICO)
**🚫 PROHIBIDO ABSOLUTO - RESETEAR BASE DE DATOS EN PRODUCCIÓN:**
- ❌ NUNCA ejecutar `DROP DATABASE` en producción
- ❌ NUNCA ejecutar `DROP TABLE` en producción
- ❌ NUNCA ejecutar `TRUNCATE` en producción
- ✅ Solo usar migraciones incrementales (ALTER TABLE, INSERT, UPDATE)
- ✅ Para nuevos campos: crear script en `backend/sql/migrations/`

### Docker
**PROHIBIDO sin confirmación:**
- `docker rm`, `docker volume rm`, `docker system prune`

### Frontend
**NUNCA ejecutar:** `ng serve`, `npm start`

### Tokens de Autenticación (CRÍTICO)
**El sistema usa DOS tokens separados en localStorage:**
- `token` + `user` → Para usuarios regulares (vendedores, marketing)
- `admin_token` + `admin_user` → Para superadmin

**El interceptor (`auth.interceptor.ts`) decide cuál usar según la URL:**
- URLs con `/api/admin/` → usa `admin_token`
- Todas las demás → usa `token`

**NUNCA crear servicios que intenten manejar tokens manualmente.** Usar siempre el interceptor centralizado.

---

## 🗄️ DATABASE

### Local MySQL (Docker)
```bash
# Ejecutar consulta
docker exec crm-mysql mysql -u root -p123456789 crm_escuelabec -e "SHOW TABLES;"

# Ejecutar archivo SQL
cat backend/sql/archivo.sql | docker exec -i crm-mysql mysql -u root -p123456789 crm_escuelabec
```

### Credenciales Docker Local
- **Root password:** `123456789`
- **DB:** `crm_escuelabec`
- **User:** `crm_user`
- **Password:** `crm_pass`
- **Puerto MySQL:** `3307` (host) → 3306 (container)
- **Puerto Backend:** `8085`
- **Puerto Frontend:** `4500`
- **Puerto Adminer:** `8081`

### Usuarios Prueba
**Superadmin (local):**
- Email: `admin@escuelabec.com`
- Password: `Admin123*`

**Hash BCrypt:**
- `Admin123*` → generar con `/api/auth/register`
- `password` → `$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi`

### SQL Files
**SIEMPRE editar archivos en `backend/sql/`:**
- `01-schema.sql` - Estructura de tablas
- `02-master-data.sql` - Datos maestros (etapas funnel, roles, permisos)
- `03-demo-data.sql` - Datos de demo/prueba

**NUNCA crear archivos SQL separados para master data.** Agregar a los existentes.

### Regla Encoding UTF-8
**NUNCA insertar datos con acentos desde terminal.** Siempre agregar en archivos SQL con UTF-8.

---

## 🎯 ARQUITECTURA

### Backend: DDD (Java Spring Boot)
```
backend/crm-api/src/main/java/com/escuelabec/crm/
├── shared/          # Transversal (User, Auth, Common exceptions)
├── lead/            # Leads y gestión del funnel
├── funnel/          # Etapas del funnel de conversión
└── admin/           # Panel de administración
```

**Al crear NUEVA ENTIDAD:**
1. Modelo: `{context}/domain/model/NuevaEntidad.java`
2. Repository: `{context}/domain/repository/NuevaEntidadRepository.java`
3. Service: `{context}/application/NuevaEntidadService.java`
4. Controller: `{context}/application/controller/NuevaEntidadController.java`
5. DTOs: `{context}/application/dto/NuevaEntidadDto.java`

**Reglas de Dependencia:**
- `domain` → Solo domain
- `application` → domain + application.dto
- `infrastructure` → Todo permitido

### Frontend: Angular 18 Standalone
```
frontend/src/app/
├── core/            # Services, Guards, Interceptors
├── shared/          # Componentes reutilizables
└── views/
    ├── layout/      # Sidebar, Navbar
    └── pages/       # Dashboard, Leads, Pipeline, Admin
```

**Reglas:**
- ✅ Standalone Components
- ✅ Bootstrap 5 primero
- ✅ UI español, código inglés
- ✅ Archivos separados: .html, .scss, .ts
- ❌ NO datos mockeados
- ❌ NO templates inline

### Angular 18 - Escapar @ en templates
En Angular 17+ el símbolo `@` es para control flow. En texto visible usar `&#64;`:
```html
<!-- ✅ CORRECTO -->
<a href="mailto:admin@escuelabec.com">admin&#64;escuelabec.com</a>
```

### Fechas en Frontend - Evitar problemas de Timezone
```typescript
// ✅ CORRECTO - Interpreta como hora local
const date = new Date(dateStr + "T00:00:00");
```

---

## 🚨 EXCEPCIONES

**PROHIBIDO `RuntimeException`:**
```java
// ❌ NUNCA
throw new RuntimeException("Not found");

// ✅ SIEMPRE
throw new ResourceNotFoundException(ErrorCode.LEAD_NOT_FOUND);
throw new AccessDeniedException(ErrorCode.ACCESS_DENIED);
throw new BusinessException(ErrorCode.VALIDATION_ERROR);
```

**Por HTTP:**
- 404: `ResourceNotFoundException`
- 403: `AccessDeniedException`
- 400: `BusinessException`

---

## 🚀 DEPLOY LOCAL

```bash
# Levantar todo con Docker
docker-compose up -d

# Ver logs del backend
docker logs crm-backend -f

# Reiniciar backend
docker-compose restart backend

# Verificar API local
curl -s http://localhost:8085/api/health
```

---

## 🎨 UI - CONTRASTE

### Reglas
- ❌ `btn-outline-secondary` → ✅ `btn-secondary`
- ❌ `bg-light text-dark` → ✅ `bg-secondary`

### Dropdowns Angular
```html
<!-- ✅ SÍ: -->
<div ngbDropdown container="body">
  <button ngbDropdownToggle>Opciones</button>
  <div ngbDropdownMenu>
    <button ngbDropdownItem>Acción</button>
  </div>
</div>
```

---

## 📋 PERMISOS

### Códigos Módulos (inglés)
- `dashboard` - Panel principal
- `leads` - Gestión de leads
- `pipeline` - Pipeline / Kanban
- `reports` - Reportes y KPIs
- `admin` - Administración

---

## 🔧 ERRORES COMUNES

### Backend
```java
// ❌ → ✅
user.getId()        // user.getUserId()
user.getName()      // user.getFirstName() + " " + user.getLastName()
```

---

## 📖 STACK
- **Backend:** Spring Boot 3.2, Java 17, MySQL 8.0, JWT
- **Frontend:** Angular 18, Bootstrap 5, TypeScript
- **Local:** Docker Compose
- **Arquitectura:** DDD (Domain-Driven Design)

---

## 🎨 COLORES DE MARCA (Escuela BEC)

```scss
// Colores principales
$primary: #1A73E8;        // Azul principal
$primary-dark: #1557B0;   // Azul oscuro - hover
$secondary: #34A853;      // Verde - éxito/conversión
$accent: #FBBC04;         // Amarillo - alertas/atención
$danger: #EA4335;         // Rojo - peligro

// Funnel colors (etapas)
$funnel-1: #9B59B6;  // Atracción - morado
$funnel-2: #3498DB;  // Captura - azul
$funnel-3: #1ABC9C;  // Nutrición - verde agua
$funnel-4: #F39C12;  // Interés - naranja
$funnel-5: #E74C3C;  // Conversión - rojo
$funnel-6: #27AE60;  // Preparado CRM - verde

// Fondos
$bg-light: #F8F9FA;
$bg-card: #FFFFFF;
$border-color: #DEE2E6;

// Texto
$text-dark: #212529;
$text-medium: #6C757D;
$text-light: #ADB5BD;
```
