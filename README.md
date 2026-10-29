# ⚽ api.unPicadito

API RESTful backend para **unPicadito**, la plataforma web para organizar, buscar y participar en partidos de fútbol recreativos ("picaditos"), gestionar solicitudes de amistad y calificar el desempeño y comportamiento de los jugadores.

---

## 🚀 Tecnologías Principales

- **Entorno de Ejecución:** [Node.js](https://nodejs.org/) (ES Modules)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Framework Web:** [Express 5](https://expressjs.com/)
- **ORM:** [TypeORM](https://typeorm.io/)
- **Base de Datos:** [MySQL](https://www.mysql.com/) (`mysql2`)
- **Validación de Datos:** [Zod](https://zod.dev/)
- **Autenticación y Seguridad:** [JSON Web Token (JWT)](https://jwt.io/), [bcrypt](https://www.npmjs.com/package/bcrypt), [CORS](https://www.npmjs.com/package/cors)
- **Comunicación en Tiempo Real:** [Socket.IO](https://socket.io/)
- **Ejecución y Recarga en Caliente:** [tsx](https://github.com/privatenumber/tsx)

---

## 📁 Estructura del Proyecto

El backend implementa una **arquitectura modular por capas**, garantizando separación de responsabilidades y alta mantenibilidad:

```text
api.unPicadito/
├── src/
│   ├── constants/              # Enums y constantes del dominio (posiciones, estados, roles)
│   │   └── type.ts
│   ├── database/               # Conexión a BD, migraciones y seeders
│   │   ├── data-source.ts      # Configuración de TypeORM DataSource
│   │   ├── migrations/         # Migraciones de esquema
│   │   └── seed.ts             # Datos iniciales para pruebas
│   ├── middlewares/            # Middlewares globales
│   │   ├── auth.middleware.ts  # Autenticación y verificación de JWT
│   │   └── validate.middleware.ts # Validación de DTOs con esquemas Zod
│   ├── modules/                # Módulos de negocio (Feature-based)
│   │   ├── friendship/         # Solicitudes y vínculos de amistad
│   │   ├── messages/           # Mensajería y chat
│   │   ├── participacionSala/  # Relación N:M usuario-partido y cupos
│   │   ├── review/             # Sistema de calificaciones y reputación
│   │   ├── sala/               # Creación, búsqueda y gestión de partidos
│   │   │   └── sala.scheduler.ts # Tarea periódica para finalizar partidos vencidos
│   │   ├── user/               # Registro, autenticación y perfil de jugadores
│   │   └── wallet/             # Saldo y movimientos de billetera
│   └── index.ts                # Punto de entrada del servidor Express
├── .env.example                # Plantilla de variables de entorno
├── package.json
└── tsconfig.json
```

### Flujo de Capas por Módulo
Cada módulo en `src/modules/<modulo>/` sigue la convención:
$$\text{Ruta} \longrightarrow \text{Middleware} \longrightarrow \text{Controlador} \longrightarrow \text{Servicio} \longrightarrow \text{Repositorio / Entidad} \longrightarrow \text{Base de Datos}$$

- `*.routes.ts`: Declaración de endpoints HTTP y asociación de middlewares.
- `*.schema.ts` / `*.dto.ts`: Esquemas de validación con Zod para `body`, `query` y `params`.
- `*.controller.ts`: Extracción de datos de la petición y envío de respuestas HTTP estandarizadas.
- `*.service.ts`: Lógica de negocio, reglas de dominio y orquestación.
- `*.entity.ts`: Definición de modelos y relaciones TypeORM para MySQL.

---

## ⚙️ Requisitos Previos

- **Node.js** (v18.0.0 o superior recomendado).
- **MySQL Server** (v8.0 o compatible) corriendo localmente o en un contenedor.
- Gestor de paquetes **npm** (o compatible: pnpm / yarn).

---

## 🛠️ Instalación y Configuración

### 1. Clonar e ingresar al directorio
```bash
cd api.unPicadito
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copia el archivo `.env.example` como `.env` y ajusta las credenciales de tu base de datos:

```bash
cp .env.example .env
```

Contenido de ejemplo para `.env`:
```env
PORT=8080
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=tu_contraseña_mysql
DB_NAME=picadito_db
JWT_SECRET=tu_clave_secreta_jwt_super_segura
```

> **Nota:** La base de datos especificada en `DB_NAME` debe existir previamente en tu servidor MySQL:
> ```sql
> CREATE DATABASE picadito_db;
> ```

### 4. Población inicial de la base de datos (Seed)
Para cargar datos de prueba (jugadores, partidos, participaciones y roles):
```bash
npm run seed
```

---

## 🚦 Ejecución

### Modo Desarrollo (con recarga automática)
```bash
npm run dev
```
El servidor quedará disponible por defecto en: `http://localhost:8080`

### Modo Producción
Compila el código TypeScript a JavaScript en `dist/` y levanta la aplicación:
```bash
npm run build
npm run start
```

---

## 📜 Endpoints de la API

### 👤 Usuarios y Autenticación (`/api/users`)
| Método | Endpoint | Autenticación | Descripción |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/users/register` | No | Registra un nuevo usuario jugador en la plataforma. |
| `POST` | `/api/users/login` | No | Inicia sesión (email o nombre de usuario) y devuelve un token JWT. |
| `GET` | `/api/users` | No | Búsqueda y listado paginado de jugadores por nombre o apodo. |
| `GET` | `/api/users/me` | **Bearer JWT** | Obtiene el perfil completo del usuario autenticado. |
| `PATCH` | `/api/users/me` | **Bearer JWT** | Actualiza datos del perfil o contraseña del usuario actual. |
| `GET` | `/api/users/:id` | No | Obtiene el perfil público de un jugador por su ID. |

---

### ⚽ Salas y Partidos (`/api/salas`)
> Requiere encabezado `Authorization: Bearer <TOKEN>` para todos los endpoints.

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/salas/buscar` | Búsqueda geográfica y con filtros (radio, fecha, disponibilidad, públicas). |
| `GET` | `/api/salas/:id` | Obtiene el detalle completo de un partido por su UUID. |
| `POST` | `/api/salas` | Crea una nueva sala/partido (valida fecha futura y hora en punto). |
| `POST` | `/api/salas/:id/unirse` | Solicita unirse a un partido como titular o suplente. |
| `DELETE` | `/api/salas/:id/salir` | Permite a un jugador abandonar un partido antes de su inicio. |
| `PATCH` | `/api/salas/:id` | Edita los datos de la sala (solo permitido al organizador). |
| `PATCH` | `/api/salas/:id/cancelar` | Cancela el partido especificando un motivo obligatorio. |
| `PATCH` | `/api/salas/:id/finalizar` | Marca el partido como finalizado. |
| `DELETE` | `/api/salas/:id/expulsar/:userId` | Expulsa a un jugador de la sala (solo organizador). |
| `PATCH` | `/api/salas/:id/transferir-organizador` | Cede la administración de la sala a otro participante. |
| `PATCH` | `/api/salas/:id/solicitudes/:participacionId/aceptar` | Acepta una solicitud de ingreso pendiente. |
| `PATCH` | `/api/salas/:id/solicitudes/:participacionId/rechazar` | Rechaza una solicitud de ingreso pendiente. |

---

### 🤝 Amistades (`/api/friendships`)
> Requiere encabezado `Authorization: Bearer <TOKEN>`.

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/friendships` | Envía una solicitud de amistad (`receiverId`). |
| `PATCH` | `/api/friendships/:id/respond` | Responde una solicitud (`ACCEPTED` o `REJECTED`). |

---

### ⭐ Reseñas y Reputación (`/api/reviews`)
| Método | Endpoint | Autenticación | Descripción |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/reviews` | **Bearer JWT** | Califica a otro jugador (1 a 5 estrellas con comentario opcional). |
| `GET` | `/api/reviews/ranking/:id` | No | Obtiene el promedio y total de valoraciones de un jugador. |

---

### 💳 Billetera (`/api/wallet`)
| Método | Endpoint | Autenticación | Descripción |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/wallet/balance` | **Bearer JWT** | Consulta el saldo disponible del usuario. |
| `POST` | `/api/wallet/webhook-mock` | No | Webhook de prueba con idempotencia para simulación de transacciones. |

---

## 📌 Reglas de Negocio Clave

1. **Horarios de los Partidos:**
   - No se pueden agendar partidos en fechas pasadas.
   - Las horas deben ser en punto (ej. `18:00`, `19:00`, con minutos en `00`).
2. **Capacidad y Roles:**
   - La sala define cupos para titulares y suplentes.
   - Los roles admitidos en la sala son: `ORGANIZADOR`, `TITULAR`, `SUPLENTE` y `SOLICITANTE`.
3. **Scheduler Automático de Partidos:**
   - Un proceso en segundo plano se ejecuta periódicamente (`sala.scheduler.ts`) para finalizar automáticamente partidos cuya fecha y duración hayan concluido.
4. **Validación en Dos Capas:**
   - Toda petición HTTP es estrictamente validada a través de esquemas tipados con **Zod** antes de alcanzar los controladores.
5. **Seguridad en Contraseñas:**
   - Las contraseñas se hashean mediante **bcrypt** con factores de salting seguros previo a su persistencia.

---

## 📋 Comandos Disponibles

| Comando | Acción |
| :--- | :--- |
| `npm run dev` | Inicia el entorno de desarrollo con recarga activa (`tsx --watch`). |
| `npm run seed` | Carga los datos de prueba iniciales en la base de datos. |
| `npm run build` | Compila el proyecto TypeScript en la carpeta `dist/`. |
| `npm run start` | Arranca la aplicación compilada en producción. |
| `npm run typeorm` | Ejecuta la CLI de TypeORM para generación y ejecución de migraciones. |
