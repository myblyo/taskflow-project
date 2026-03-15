# TaskFlow — Lista de tareas

Aplicación web de lista de tareas con filtros por categoría, prioridad y estado, tema claro/oscuro, barra de progreso y borrado múltiple. Los datos se guardan en `localStorage`.

---

## Estructura del proyecto

| Archivo / carpeta       | Descripción |
|-------------------------|-------------|
| `index.html`            | Página principal: sidebar, formulario, lista de tarjetas, header |
| `app.js`                | Lógica: tareas, tarjetas, filtros, modo selección, progreso, tema |
| `Componentes/style.css` | Entrada de estilos (importa el resto de CSS) |
| `Componentes/*.css`     | Estilos por módulo (card, form, glass, sidebar, etc.) |

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

Cada tarea tiene: `id`, `title`, `description`, `category`, `priority`, `dueDate` (dd-mm-aaaa), `completed` (boolean), `status` ('Pendiente' | 'En progreso' | 'Completada'). Se guardan en `localStorage` bajo la clave `'tasks'`.
