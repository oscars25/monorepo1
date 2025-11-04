#  Comandos Útiles - Chat Widget

## Docker Commands

### Gestión de Servicios

```bash
# Iniciar servicios
docker-compose up -d

# Iniciar con reconstrucción
docker-compose up --build -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Reiniciar un servicio
docker-compose restart backend
docker-compose restart frontend

# Ver estado de contenedores
docker-compose ps

# Ver recursos usados
docker stats
```

### Troubleshooting

```bash
# Reconstruir sin caché
docker-compose build --no-cache

# Forzar recreación de contenedores
docker-compose up --force-recreate -d

# Entrar a un contenedor
docker exec -it chatwidget-backend bash
docker exec -it chatwidget-frontend sh

# Ver logs de un contenedor específico
docker logs chatwidget-backend
docker logs chatwidget-frontend

# Limpiar todo (cuidado!)
docker system prune -a
```

##  Testing API con curl

### Sesiones

```bash
# Crear sesión
curl -X POST http://localhost:8080/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "websiteUrl": "http://example.com",
    "visitorName": "Juan Pérez",
    "visitorEmail": "juan@example.com"
  }'

# Obtener todas las sesiones
curl http://localhost:8080/api/sessions

# Obtener una sesión específica
curl http://localhost:8080/api/sessions/{sessionId}

# Cerrar sesión
curl -X POST http://localhost:8080/api/sessions/{sessionId}/close \
  -H "Content-Type: application/json"
```

### Mensajes

```bash
# Crear mensaje de visitante
curl -X POST http://localhost:8080/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "abc123",
    "content": "Hola, necesito ayuda",
    "isFromAgent": false,
    "visitorName": "Visitante"
  }'

# Crear mensaje de agente (requiere autenticación)
curl -X POST http://localhost:8080/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sessionId": "abc123",
    "content": "¿En qué puedo ayudarte?",
    "isFromAgent": true
  }'

# Obtener mensajes de una sesión
curl http://localhost:8080/api/messages/session/{sessionId}

# Actualizar mensaje
curl -X PUT http://localhost:8080/api/messages/{messageId} \
  -H "Content-Type: application/json" \
  -d '{"content": "Mensaje actualizado"}'

# Eliminar mensaje
curl -X DELETE http://localhost:8080/api/messages/{messageId}
```

### Autenticación

```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password"
  }'

# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "password",
    "email": "user@example.com",
    "role": "AGENT",
    "fullName": "New User"
  }'
```

##  Debugging

### Ver logs del backend

```bash
# Últimas 100 líneas
docker logs --tail 100 chatwidget-backend

# Seguir logs en tiempo real
docker logs -f chatwidget-backend

# Con timestamps
docker logs -f --timestamps chatwidget-backend
```

### Ver logs del frontend

```bash
# Logs de nginx
docker logs -f chatwidget-frontend

# Entrar al contenedor y ver configuración
docker exec -it chatwidget-frontend sh
cat /etc/nginx/conf.d/default.conf
```

### Verificar conectividad

```bash
# Desde tu máquina local
curl http://localhost:8080/api/sessions
curl http://localhost

# Desde el contenedor frontend hacia el backend
docker exec chatwidget-frontend wget -qO- http://backend:8080/api/sessions

# Desde el contenedor backend hacia la base de datos
docker exec chatwidget-backend curl -v telnet://postgres:5432
```

##  Monitoreo

### Ver uso de recursos

```bash
# Ver stats en tiempo real
docker stats

# Ver stats de un contenedor específico
docker stats chatwidget-backend

# Ver uso de disco
docker system df

# Ver imágenes
docker images

# Ver volúmenes
docker volume ls
```

### Inspeccionar contenedores

```bash
# Inspeccionar contenedor
docker inspect chatwidget-backend

# Ver IP del contenedor
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' chatwidget-backend

# Ver variables de entorno
docker inspect -f '{{.Config.Env}}' chatwidget-backend
```

##  Mantenimiento

### Limpiar recursos no usados

```bash
# Limpiar contenedores detenidos
docker container prune

# Limpiar imágenes no usadas
docker image prune

# Limpiar volúmenes no usados
docker volume prune

# Limpiar todo (cuidado!)
docker system prune -a --volumes
```

### Backup de base de datos

```bash
# Si tienes un contenedor de PostgreSQL
docker exec -t postgres_container pg_dump -U username dbname > backup.sql

# Restaurar
docker exec -i postgres_container psql -U username dbname < backup.sql
```

##  Despliegue

### Construcción local

```bash
# Backend
cd chat-widget-monorepo/chat-widget-backend
mvn clean package -DskipTests
java -jar target/*.jar

# Frontend
cd ../frontend-dashboard
npm install
ng build
```

### Variables de entorno

```bash
# Crear archivo .env
cat > .env << EOF
DATABASE_URL=jdbc:postgresql://host:5432/db
DATABASE_USERNAME=user
DATABASE_PASSWORD=pass
JWT_SECRET=secret
JWT_EXPIRATION=86400000
EOF

# Usar archivo .env
docker-compose --env-file .env up -d
```

##  Testing Frontend

### Navegadores

```bash
# Abrir en navegador por defecto
start http://localhost        # Windows
open http://localhost         # Mac
xdg-open http://localhost     # Linux

# Con curl
curl -I http://localhost
```

### Network Debugging

```bash
# Ver peticiones con tcpdump (Linux)
sudo tcpdump -i any -n port 8080

# Ver conexiones activas
netstat -an | grep 8080
```

##  Tips

### Aliases útiles (añadir a tu .bashrc o .zshrc)

```bash
# Docker
alias dps='docker ps'
alias dlog='docker-compose logs -f'
alias dup='docker-compose up -d'
alias ddown='docker-compose down'
alias drestart='docker-compose restart'

# Chat Widget específicos
alias chat-up='cd ~/monorepo1 && docker-compose up -d'
alias chat-down='cd ~/monorepo1 && docker-compose down'
alias chat-logs='cd ~/monorepo1 && docker-compose logs -f'
alias chat-backend='cd ~/monorepo1 && docker-compose logs -f backend'
alias chat-frontend='cd ~/monorepo1 && docker-compose logs -f frontend'
```

### Atajos de PowerShell (Windows)

```powershell
# Agregar a tu $PROFILE
function chat-up { docker-compose up -d }
function chat-down { docker-compose down }
function chat-logs { docker-compose logs -f }
function chat-backend { docker-compose logs -f backend }
function chat-frontend { docker-compose logs -f frontend }
```

---

##  Referencias Rápidas

- **Frontend**: http://localhost
- **Backend**: http://localhost:8080


