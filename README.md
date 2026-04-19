# TaskFlow — Lista de tareas

Aplicación web de lista de tareas con filtros por categoría, prioridad y estado, tema claro/oscuro, barra de progreso y borrado múltiple. Las tareas se obtienen y modifican mediante un **backend** (API REST en Node/Express; persistencia en memoria en el servidor).

---

## Cómo desplegar

### 1) Ejecutar en local

1. Instala dependencias del backend:
   ```bash
   cd server
   npm install
   ```
2. Inicia la API:
   ```bash
   npm run dev
   ```
   La API queda en `http://localhost:3000/api/v1/tasks`.
3. En otra terminal, vuelve a la raíz y abre `index.html` con Live Server (o cualquier servidor estático).
4. Verifica que el front cargue tareas sin errores de red.

### 2) Desplegar en Vercel (frontend + API)

Este proyecto ya trae `vercel.json`, así que puedes desplegar front y backend en el mismo dominio:

1. Sube el repositorio a GitHub.
2. En Vercel, crea **New Project** y conecta el repo.
3. Usa preset **Other** y deja el proyecto sin build command adicional.
4. Pulsa **Deploy**.

En producción, el cliente usa automáticamente `"/api/v1/tasks"` en el mismo origen, por lo que no necesitas cambiar la URL de la API.

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

## Tecnologias utilizadas

### Frontend

- HTML5
- CSS3 (modular en `Componentes/*.css`)
- JavaScript (ES Modules)
- Tailwind CSS (via CDN para utilidades puntuales)

### Backend

- Node.js
- Express
- CORS
- Dotenv

### Herramientas y despliegue

- Nodemon (desarrollo backend)
- Vercel (hosting frontend + serverless API con `vercel.json`)
- Git y GitHub (control de versiones)

---

## Documentacion del backend

La documentacion especifica del backend, arquitectura y endpoints ahora esta en:

- `docs/server/README.md`
