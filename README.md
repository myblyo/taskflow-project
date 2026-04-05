# TaskFlow — Lista de tareas

Aplicación web de lista de tareas con filtros por categoría, prioridad y estado, tema claro/oscuro, barra de progreso y borrado múltiple. Las tareas se obtienen y modifican mediante un **backend** (API REST en Node/Express; persistencia en memoria en el servidor).

---

## Estructura del proyecto

| Archivo / carpeta        | Descripción |
|--------------------------|-------------|
| `index.html`             | Página principal: sidebar, formulario, lista de tarjetas, header |
| `js/app.js`              | Lógica: tareas, tarjetas, filtros, modo selección, progreso, tema |
| `js/api/client.js`       | Cliente HTTP (`fetch`) hacia `/api/v1/tasks` |
| `Componentes/style.css`  | Entrada de estilos (importa el resto de CSS) |
| `Componentes/*.css`      | Estilos por módulo (card, form, glass, sidebar, etc.) |
| `server/`                | Backend Express (ver sección *Arquitectura, carpetas y API*) |

---

## Componentes de la interfaz

Descripción de **cada elemento que se muestra en la pantalla** y para qué sirve.

### Barra lateral (sidebar)

| Componente | Para qué sirve |
|-------------|----------------|
| **Barra de progreso** | Muestra el avance global: **porcentaje en grande** (tareas completadas), una **barra verde** que se rellena según ese porcentaje y, debajo, el texto **"X/Y tareas"** (ej. "2/8 tareas"). Se actualiza al añadir, completar o borrar tareas. |
| **Botón "🗑 filtros"** | Limpia todos los filtros del sidebar (desmarca categoría, prioridad y estado) y vuelve a mostrar todas las tarjetas. |
| **Sección "Categorías"** | Desplegable con checkboxes: **Trabajo**, **Estudio**, **Personal**, **Otro**. Al marcar uno o más, solo se muestran las tareas de esas categorías. |
| **Sección "Prioridad"** | Desplegable con checkboxes: **Alto**, **Medio**, **Bajo**. Filtra las tareas por la prioridad elegida. |
| **Sección "Estado"** | Desplegable con checkboxes: **Pendiente**, **En progreso**, **Completada**. Filtra por el estado de la tarea. Los filtros de categoría, prioridad y estado se combinan (AND entre grupos; dentro de cada grupo, OR). |

### Zona principal (contenido)

| Componente | Para qué sirve |
|-------------|----------------|
| **Título "Lista de tareas"** | Título de la aplicación (h1). |
| **Botón "Seleccionar"** | Activa el **modo selección**: aparecen los checkboxes en cada tarjeta para marcar varias y borrarlas a la vez. Al activarse, el botón pasa a decir **"Cancelar"** y se resalta; al pulsar de nuevo se sale del modo y se limpia la selección. |
| **Botón "🗑" (basura)** | **Borrar tareas seleccionadas**. Solo está activo en modo selección y cuando hay al menos una tarjeta marcada; entonces se pone en rojo. Al pulsar, elimina todas las tareas seleccionadas y sale del modo selección. |
| **Toggle tema (claro/oscuro)** | Cambia entre **tema claro** y **tema oscuro**. La preferencia se guarda y se aplica al volver a abrir la página. |
| **Formulario "Agregar tarea"** | Crea una nueva tarea. Campos: **Título** (obligatorio), **Categoría** y **Prioridad** (selects), **Descripción** (opcional), **Fecha** (dd-mm-aaaa). El botón **"+ Agregar tarea"** envía el formulario; si hay error de validación, se muestra debajo. |
| **Lista de tarjetas** | Contenedor donde se pintan todas las tarjetas de tareas. Si no hay tareas, está vacío. |

### Tarjeta de tarea (cada card)

| Componente | Para qué sirve |
|-------------|----------------|
| **Fondo de la tarjeta** | Color según la **categoría** de la tarea (Trabajo, Estudio, Personal, Otro). |
| **Checkbox** | En **modo normal** está oculto. En **modo selección** se muestra y sirve para **marcar la tarea para borrado** (varias a la vez con el botón 🗑 del header). No se usa para marcar completada; eso se hace con el badge de estado. |
| **Título** | Texto de la tarea. Si está completada, se muestra tachado y con menor opacidad. |
| **Badge de estado** | Muestra el estado actual: **Pendiente**, **En progreso** o **Completada**. Al hacer clic se abre un desplegable para **cambiar el estado**; el color del badge cambia según el estado (azul, ámbar, verde). |
| **Menú de tres puntos (⋮)** | Abre un menú con **Editar** (abre el modal de edición) y **Borrar** (elimina solo esa tarea). |
| **Descripción** | Texto opcional de la tarea; solo se muestra si tiene contenido. |
| **Meta (badges + fecha)** | Muestra la **categoría**, la **prioridad** y la **fecha** de entrega (📅 dd-mm-aaaa) con el mismo estilo de badges que el estado. |

### Modal de edición

Aparece al pulsar **Editar** en el menú ⋮ de una tarjeta.

| Componente | Para qué sirve |
|-------------|----------------|
| **Título del modal** | "Editar tarea". |
| **Mensaje de error** | Si la validación falla (título vacío, fecha inválida, etc.), se muestra aquí. |
| **Campos** | Título, Categoría, Prioridad, Estado (Pendiente / En progreso / Completada), Descripción, Fecha. Se rellenan con los datos actuales de la tarea. |
| **Botón "Cancelar"** | Cierra el modal sin guardar cambios. |
| **Botón "Guardar"** | Valida, actualiza la tarea en memoria y en la tarjeta, guarda en `localStorage` y cierra el modal. |

---

## Documentación de funciones (`app.js`)

Resumen por bloques. Detalles en los JSDoc del código.

- **Filtros (DOM):** `getFilterCheckboxes`
- **Storage:** `safeLoadJson`, `safeSaveJson`
- **Tema:** `initTheme`
- **Formulario:** `ensureFormMessageArea`, `showFormError`, `clearFormMessage`, `getFormValue`
- **Fechas:** `parseUserDate`, `isValidDateInputValue`, `isPastDate`
- **Tareas:** `buildTaskFromForm`, `validateTask`, `getTaskStatusLabel`
- **DOM / tarjetas:** `createElement`, `createTaskMeta`, `setCardDatasets`, `closeAllCardDropdowns`, `updateCardContent`, `openEditModal`, `escapeAttr`, `removeTaskCard`, `renderTaskCard`
- **Filtros (lógica):** `getCheckedFilterValues`, `applyFilters`, `initFilters`
- **Estado:** `nextTaskId`, `saveTasks`, `updateProgress`
- **Modo selección:** `setSelectMode`, `updateDeleteSelectedState`, `deleteSelectedTasks`

---

## Modelo de datos (Task)

Cada tarea tiene: `id`, `title`, `description`, `category`, `priority`, `dueDate` (dd-mm-aaaa), `completed` (boolean), `status` ('Pendiente' | 'En progreso' | 'Completada'). La fuente de verdad es el **servidor**; el navegador mantiene una copia en memoria para la UI.

---

## Arquitectura, carpetas y API

Marca cada ítem cuando lo hayas revisado o completado en el proyecto.

- [ ] **Arquitectura por capas**

  **Frontend (estático):** capa de presentación (`index.html` + `Componentes/*.css`) y capa de aplicación en el navegador (`js/app.js`: validación, DOM, estado en memoria). Las llamadas HTTP están aisladas en **`js/api/client.js`** (cliente de la API).

  **Backend (`server/`):** patrón en capas típico de Express:
  - **Rutas** (`src/routes/`) — definen método, path y delegan al controlador.
  - **Controladores** (`src/controllers/`) — leen `req`, validan entrada básica, llaman al servicio y envían `res.json` / códigos HTTP.
  - **Servicios** (`src/services/`) — lógica de negocio y acceso a datos (aquí un array en memoria).
  - **Middlewares** (`src/middlewares/`) — p. ej. registro de peticiones.
  - **Config** (`src/config/`) — variables de entorno (puerto).
  - **`src/index.js`** — arranque de Express, CORS, JSON, prefijo `/api/v1/tasks`, middleware global de errores.

  - [ ] **Estructura de carpetas**

    | Ruta | Rol |
    |------|-----|
    | `index.html` | Entrada del front |
    | `js/app.js` | Lógica de UI y estado |
    | `js/api/client.js` | `fetch` hacia la API |
    | `Componentes/*.css` | Estilos modulares |
    | `server/src/index.js` | Servidor Express |
    | `server/src/routes/task.routes.js` | Rutas REST de tareas |
    | `server/src/controllers/task.controller.js` | Manejo HTTP por recurso |
    | `server/src/services/task.services.js` | Persistencia en memoria |
    | `server/src/middlewares/logger.js` | Logging |
    | `server/src/config/env.js` | `PORT` (por defecto `3000`) |

  - [ ] **Endpoints API**

    Base URL (local): `http://localhost:3000/api/v1/tasks`

    | Método | Ruta | Descripción |
    |--------|------|-------------|
    | `GET` | `/api/v1/tasks` | Lista todas las tareas |
    | `POST` | `/api/v1/tasks` | Crea una tarea |
    | `PATCH` | `/api/v1/tasks/:id` | Actualiza campos parciales |
    | `DELETE` | `/api/v1/tasks/:id` | Elimina por `id` |

    Cabeceras habituales en escritura: `Content-Type: application/json`. CORS habilitado para orígenes que consuman el API desde el navegador.

  - [ ] **Ejemplos request / response**

    **GET** `http://localhost:3000/api/v1/tasks`  
    **Response** `200` — cuerpo: array JSON (puede ser `[]`).

    ```json
    [
      {
        "id": "1775402688432",
        "title": "Comprar leche",
        "description": "",
        "completed": false,
        "status": "Pendiente",
        "category": "Personal",
        "priority": "Medio",
        "dueDate": "15-04-2026",
        "creadaEn": "2026-04-05T15:24:48.432Z"
      }
    ]
    ```

    **POST** `http://localhost:3000/api/v1/tasks`  
    **Body** (ejemplo):

    ```json
    {
      "title": "Nueva tarea",
      "description": "opcional",
      "completed": false,
      "category": "Trabajo",
      "priority": "Alto",
      "dueDate": "20-04-2026"
    }
    ```

    **Response** `201` — objeto de la tarea creada (incluye `id`, `creadaEn`, etc.).  
    **Response** `400` — `{ "error": "El título es obligatorio." }` (u otro mensaje de validación).

    **PATCH** `http://localhost:3000/api/v1/tasks/1775402688432`  
    **Body** (solo campos a cambiar):

    ```json
    {
      "status": "Completada",
      "completed": true
    }
    ```

    **Response** `200` — tarea actualizada.  
    **Response** `404` — `{ "error": "Task not found." }`

    **DELETE** `http://localhost:3000/api/v1/tasks/1775402688432`  
    **Response** `200` — `{ "message": "tarea eliminada" }`  
    **Response** `404` — `{ "error": "Task not found." }`

    **Probar desde terminal (curl):**

    ```bash
    curl -s http://localhost:3000/api/v1/tasks
    curl -s -X POST http://localhost:3000/api/v1/tasks -H "Content-Type: application/json" -d "{\"title\":\"Demo\",\"description\":\"\"}"
    ```
