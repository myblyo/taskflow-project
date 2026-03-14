# Mejoras sugeridas: rendimiento, buenas prácticas y posibles errores

Revisión desde la perspectiva de código limpio, rendimiento y robustez. Prioridad: **P0** = crítico, **P1** = importante, **P2** = recomendable.

---

## 1. Posibles errores (bugs / fragilidad)

### P0 – Código de navegador en `postcss.config.js`
- **Problema**: Las líneas 8–21 usan `document`, `localStorage` y `addEventListener`. Ese archivo se ejecuta en **Node** (build), donde no existen. Puede romper scripts de build o herramientas que lean el proyecto.
- **Acción**: Eliminar todo el bloque desde `const toggle = ...` hasta el final. La lógica de tema ya está correctamente en `app.js`.

### P0 – Referencias DOM nulas en `buildTaskFromForm()`
- **Problema**: Se llama a `document.getElementById('task-title')`, `getElementById('task-desc')`, etc. sin comprobar si son `null`. Si falla un ID o el script se ejecuta antes de que exista el formulario, la app lanza y deja de funcionar.
- **Acción**: Comprobar que cada elemento existe antes de leer `.value`, o usar optional chaining y devolver/validar un objeto por defecto para no lanzar.

### P1 – IDs de tarea con `Date.now()`
- **Problema**: Dos tareas creadas en el mismo milisegundo (p. ej. doble clic rápido) pueden recibir el mismo `id`, lo que rompe la unicidad y el filtrado/borrado.
- **Acción**: Usar `Date.now()` + un contador, o `crypto.randomUUID()` si el navegador lo soporta, para garantizar IDs únicos.

### P1 – Filtro "En progreso" sin efecto
- **Problema**: En el HTML hay un filtro por estado "En progreso", pero el modelo de datos solo tiene `completed: true/false` (Pendiente/Completada). Ninguna tarea tiene estado "En progreso", por lo que ese filtro nunca muestra resultados coherentes.
- **Acción**: O bien quitar "En progreso" del sidebar, o bien ampliar el modelo con `status: 'Pendiente' | 'En progreso' | 'Completada'` y la UI para cambiarlo.

### P2 – Atributo `pattern` del campo fecha
- **Problema**: En HTML, `pattern="\\d{2}-\\d{2}-\\d{4}"` puede no interpretarse como se espera (escapado de barras). La validación real ya está en JS con `parseUserDate`.
- **Acción**: Usar `pattern="[0-9]{2}-[0-9]{2}-[0-9]{4}"` para evitar dudas con `\d`, o confiar solo en la validación JS y dejar `pattern` como ayuda opcional.

---

## 2. Rendimiento

### P1 – Múltiples `querySelectorAll` en cada filtrado
- **Problema**: `applyFilters()` llama a `getCheckedValues()` tres veces (categoría, prioridad, estado). Cada llamada hace un `document.querySelectorAll` distinto. Luego se hace otro `querySelectorAll('.card-task')`. Con muchas tareas y filtros usados a menudo, se repite trabajo innecesario.
- **Acción**: Cachear una sola vez al cargar: `const filterCheckboxNodes = document.querySelectorAll('.f-cat, .f-pri, .f-sta')` y reutilizar; para las tarjetas, seguir con `querySelectorAll('.card-task')` o, si se re-renderiza toda la lista, mantener una referencia al contenedor y a los hijos.

### P2 – Búsqueda lineal en cada cambio de checkbox
- **Problema**: Al marcar/desmarcar una tarea se hace `tasks.find(t => t.id === task.id)`. Con pocas tareas está bien; con cientos, un `Map<id, task>` mejoraría.
- **Acción**: Solo si la lista crece mucho, mantener un `Map` por id además del array y usarlo en el handler del checkbox y en `removeTaskCard`.

### P2 – Carga de CSS con `@import`
- **Problema**: En `index.html` se usa `<style>@import url("Componentes/style.css");</style>`. `@import` puede bloquear o retrasar el primer render y dificulta el paralelismo de descarga.
- **Acción**: Sustituir por `<link rel="stylesheet" href="Componentes/style.css">` para que el navegador cargue el CSS de forma más eficiente.

---

## 3. Buenas prácticas

### P0 – Botón de reset sin `type="button"`
- **Problema**: El botón "🗑 filtros" no tiene `type="button"`. Dentro de un formulario sería `type="submit"` por defecto y podría enviar el formulario.
- **Acción**: Añadir `type="button"` a `#resetBtn`.

### P1 – Toggle de tema sin etiqueta para lectores de pantalla
- **Problema**: El checkbox de modo oscuro no tiene `aria-label`, por lo que usuarios de lector de pantalla no saben su propósito.
- **Acción**: Añadir `aria-label="Cambiar a modo oscuro"` (o similar) al input `#darkToggle`.

### P1 – JSDoc desactualizado en `Task`
- **Problema**: El `@typedef Task` dice que `dueDate` es "YYYY-MM-DD", pero la app usa formato **dd-mm-aaaa**.
- **Acción**: Actualizar el comentario a "Formato dd-mm-aaaa".

### P2 – Feedback cuando `localStorage` falla al guardar
- **Problema**: `safeSaveJson` devuelve `false` si falla (cuota, modo privado, etc.), pero ese valor no se usa. Las tareas quedarían solo en memoria y se perderían al recargar sin que el usuario lo sepa.
- **Acción**: Si `saveTasks` recibe `false` de `safeSaveJson`, mostrar un mensaje discreto (por ejemplo en el área de mensajes del formulario o un pequeño toast) indicando que no se pudo guardar.

### P2 – Estilos inline en mensaje de error
- **Problema**: En `ensureFormMessageArea` se usa `area.style.display = 'none'`. Funciona, pero concentrar estilos en CSS mejora mantenibilidad.
- **Acción**: Usar una clase (por ejemplo `.form-message.is-hidden`) y definir `display: none` en CSS; quitar la asignación directa a `style` donde sea posible.

---

## 4. Resumen de prioridades

| Prioridad | Acción |
|-----------|--------|
| **P0** | Limpiar `postcss.config.js`; comprobar nulos en `buildTaskFromForm`; `type="button"` en reset. |
| **P1** | IDs únicos para tareas; alinear filtro "En progreso" con el modelo; cachear nodos de filtros; `aria-label` en darkToggle; actualizar JSDoc de `dueDate`. |
| **P2** | Sustituir `@import` por `<link>`; opcional Map por id si crece la lista; feedback si falla `localStorage`; clase CSS para ocultar mensaje. |

Si quieres, el siguiente paso puede ser aplicar en el repo solo los cambios **P0** (y opcionalmente los P1 que no requieran cambiar el modelo de datos).
