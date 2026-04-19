# Backend TaskFlow (`server/`)

Documentacion especifica del backend (API REST) del proyecto.

---

## Resumen

El backend esta hecho con **Node.js + Express** y expone la API en:

- Base URL local: `http://localhost:3000/api/v1/tasks`

La persistencia es **en memoria** (array en el proceso del servidor), por lo que al reiniciar el servidor se pierden los datos.

---

## Como ejecutar solo el backend

Desde la raiz del proyecto:

```bash
cd server
npm install
npm run dev
```

Scripts disponibles en `server/package.json`:

- `npm run dev`: arranque con `nodemon`
- `npm start`: arranque normal con `node`

---

## Como funciona internamente

Arquitectura por capas en `server/src/`:

- `routes/`: define rutas y metodos HTTP.
- `controllers/`: recibe `req`/`res`, valida entrada y delega.
- `services/`: logica de negocio y acceso a datos en memoria.
- `middlewares/`: middleware de logging.
- `validation/`: validaciones de body para crear tareas.
- `config/`: variables de entorno (`PORT`).
- `app.js`: configura Express, CORS, JSON y rutas.
- `index.js`: levanta el servidor.

Flujo general:

1. Llega una peticion a `/api/v1/tasks`.
2. La ruta llama al controlador correspondiente.
3. El controlador valida y usa el servicio.
4. El servicio devuelve el resultado al controlador.
5. El controlador responde en JSON con codigo HTTP.

---

## Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `GET` | `/api/v1/tasks` | Lista todas las tareas |
| `POST` | `/api/v1/tasks` | Crea una tarea |
| `PATCH` | `/api/v1/tasks/:id` | Actualiza campos parciales |
| `DELETE` | `/api/v1/tasks/:id` | Elimina por `id` |

---

## Modelo de datos (Task)

Campos esperados:

- `id`
- `title`
- `description`
- `completed`
- `status` (`Pendiente` | `En progreso` | `Completada`)
- `category`
- `priority`
- `dueDate` (formato `dd-mm-aaaa`)
- `creadaEn`

---

## Ejemplos de requests

### GET tareas

```bash
curl -s http://localhost:3000/api/v1/tasks
```

### POST tarea

```bash
curl -s -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Demo\",\"description\":\"\",\"category\":\"Trabajo\",\"priority\":\"Medio\",\"dueDate\":\"20-04-2026\"}"
```

### PATCH tarea

```bash
curl -s -X PATCH http://localhost:3000/api/v1/tasks/1775402688432 \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"Completada\",\"completed\":true}"
```

### DELETE tarea

```bash
curl -s -X DELETE http://localhost:3000/api/v1/tasks/1775402688432
```
