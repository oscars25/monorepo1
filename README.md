## Chatwidget con Angular (frontend) + Springboot (backend)

Este es un proyecto para desarrollar un chat embebido. cuyo proposito es brindar el servicio de chat a los usuarios para contactarse con un asesor o un agente de las paginas web en las que este sea usado.

A continuacion daremos los pasos y requerimientos necesarios para poder levantar los entornos de desarrollo y produccion.

## *Requisitos previos!*

  
Antes de comenzar, asegúrate de tener instalado:

|Herramineta| Version minima  |Verificacion|
|--|--|--|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/)|  4.x|`docker --version`|
|[Docker Compose](https://docs.docker.com/compose/)|v2.x (ya viene con Docker Desktop|`docker compose version`|
| [Git](https://git-scm.com/install/)|  cualquier version|`git --version`|

Es muy importante que en windows tener habilitado WSL2 en Docker Desktop

## Configuracion inicial

 1. Clonar el repositorio: 
	 `git clone https://github.com/oscars25/monorepo1.git`
 2. Crear archivo .env: 

>  \#==== NEON (Remoto / Producción) ====
> DATABASE_URL=jdbc:postgresql://ep-muddy-bush-afqgdsmi-pooler.c-2.us-west-2.aws.neon.tech:5432/neondb?sslmode=require&channel_binding=require
> DATABASE_USERNAME=neondb_owner
> DATABASE_PASSWORD=npg_MNPE3f2VSOqz
> \#==== LOCAL (Desarrollo) ==== 
> LOCAL_DB_USER=user 
> LOCAL_DB_PASSWORD=password 
> LOCAL_DB_NAME=monorepo_db

## Modos de ejecucion

| Modo | Descripcion |Comando|
|--|--|--|
| Local (Desarrollo) | Levanta `db` (Postgres), `backend` y `frontend`. Ideal para programar. |`docker compose up --build`|
|Remoto (Produccion/neon)|Solo levanta `backend` y `frontend`, conectando el backend a Neon.|`docker compose -f docker-compose.yml up --build`|

## Modos de ejecucion

### Desarrollo local

 1. Asegurate de tener el archivo .env creado.
 2. Desde la raiz del proyecto, ejevcuta el los siguientes comandos
    `docker compose down -v`
    `docker compose up --build`
 3. Verifica que todo funcione.	
	 - **Frontend:** [http://localhost](http://localhost)
	-   **Backend (API):** http://localhost:8080

### Desarrollo remoto (produccion/neon)
 1. Asegúrate que tu `.env` tenga las credenciales reales de Neon.
 2. Ejecuta los siguintes comandos desde la raiz.
	`docker compose -f docker-compose.yml up --build`
 3. Verifica que todo funcione.	
	 - **Frontend:** [http://localhost](http://localhost)
	-   **Backend (API):** http://localhost:8080
