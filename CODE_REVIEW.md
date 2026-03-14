# Code Review: Lista de tareas

## Resumen
La aplicación es una lista de tareas con filtros por categoría, prioridad y estado, tema claro/oscuro y persistencia en `localStorage`. El código es funcional y corto; estas mejoras se centran en legibilidad, consistencia de datos, rendimiento y estructura.

---

## 1. Legibilidad

### Constantes y magic strings
- Valores como `"Trabajo"`, `"Alto"`, `"Pendiente"` están repetidos en HTML y en JS. Conviene centralizarlos en constantes (p. ej. `CATEGORIES`, `PRIORITIES`, `STATUSES`) para evitar errores y facilitar cambios.

### Nombres de funciones
- `vals(sel)` no explica qué hace. Un nombre como `getCheckedFilterValues(selector)` mejora la lectura.

### Comentarios
- Los bloques `// ── X ──` ayudan; se puede añadir un comentario breve en la lógica de filtros (qué hace cada condición) para quien mantenga el código.

### HTML inline
- En `index.html` línea 44: `style="display:flex; ..."` es mejor llevarlo a una clase en CSS (p. ej. `.header-row`) para mantener estilos en un solo lugar.

---

## 2. Rendimiento

### Filtros
- `applyFilters()` llama a `vals()` tres veces, y cada `vals()` hace `querySelectorAll` de nuevo. Para pocos elementos no es problema, pero se puede cachear la lista de checkboxes de filtros al cargar la página y reutilizarla.

### Búsqueda en array
- `tasks.find(t => t.id === task.id)` en el handler del checkbox está bien; el array es pequeño. Si creciera mucho, un `Map` por id podría ser útil (no prioritario ahora).

### Clases de prioridad
- El objeto `{ Alto: 'badge-alto', ... }` se crea en cada `renderCard`. Se puede definir una sola vez como constante fuera de la función.

---

## 3. Estructura y datos

### Bug: estado “En progreso”
- En el HTML hay tres opciones de estado: **Pendiente**, **En progreso**, **Completada**.
- En el modelo de datos solo existe `completed: true/false`, y en el filtro se hace:
  `done ? 'Completada' : 'Pendiente'`.
- **“En progreso” nunca se asigna**: esa opción del filtro no tiene efecto.
- **Opciones**:
  1. Añadir un campo `status` con valores `'Pendiente' | 'En progreso' | 'Completada'` (y actualizar formulario, render y filtros), o
  2. Quitar “En progreso” del filtro y dejar solo Pendiente/Completada hasta que el modelo lo soporte.

### Fuente única de verdad
- Categorías y prioridades están en el HTML (formulario y filtros) y en el JS. Definirlas en JS y generar las `<option>` y los filtros desde ahí evita desincronización.

### Seguridad (XSS)
- Se usa `innerHTML` con `task.title` y `task.description`. Si esos datos vinieran de otra fuente (o se guardaran sin control), podría haber XSS. Es más seguro usar `textContent` o crear nodos de texto para el contenido de usuario y reservar `innerHTML` solo para estructura sin datos dinámicos, o escapar siempre el contenido.

### IDs en el DOM
- Se usa `id="cb-${task.id}"`. Si por error se crearan dos tareas con el mismo `id` (p. ej. doble envío rápido con `Date.now()`), habría IDs duplicados. Alternativas: usar `class` o `data-task-id` y buscar el checkbox dentro del `article` con `querySelector` en lugar de un id global.

---

## 4. Mejoras sugeridas (resumen)

| Área        | Acción |
|------------|--------|
| Legibilidad | Constantes para categorías, prioridades y estados; renombrar `vals`; clase CSS para el header en lugar de estilos inline. |
| Rendimiento | Constante para mapa de prioridad → clase; opcional: cache de nodos de filtros. |
| Estructura  | Decidir modelo de estado (tres estados o dos) y alinear HTML y JS; considerar generación de opciones/filtros desde datos. |
| Seguridad   | Evitar `innerHTML` con contenido de usuario (textContent o escape). |
| Robustez   | Evitar IDs únicos por tarea en el DOM; usar nodos bajo el `article` con `querySelector`. |

Si quieres, el siguiente paso puede ser aplicar estos cambios en `app.js` y en `index.html` (y, si aplica, en el CSS) manteniendo la misma funcionalidad visible para el usuario.
