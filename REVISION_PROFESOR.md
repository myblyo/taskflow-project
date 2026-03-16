# Revisión del código JavaScript (app.js) — Enfoque didáctico

Esta revisión actúa como un profesor de programación: se buscan **errores**, **mejoras posibles** y **buenas prácticas** aplicables.

---

## 1. ¿Hay errores?

### 1.1 Posibles bugs o fragilidades

| Ubicación | Qué pasa | Severidad |
|-----------|----------|-----------|
| **`parseUserDate`** (línea 172) | Solo acepta el formato `dd-mm-yyyy`. Si en algún momento llega una fecha con barras (`15/03/2025`) —por ejemplo al pegar o desde otra parte del código—, devolverá `null` y la validación fallará. | Baja (si solo usas el input actual, no se da) |
| **`deleteSelectedTasks`** (línea 739) | La variable `const before = tasks.length;` se declara pero **nunca se usa**. No rompe nada, pero es código muerto. | Muy baja |
| **`nextTaskIdValue`** (línea 443) | Si `tasks` estuviera vacío, `Math.max(...[])` es `-Infinity`; ya lo evitas con `tasks.length ? ... : 1`, así que está bien. | Ninguna (bien resuelto) |

### 1.2 Lo que está bien resuelto

- **`escapeAttr`**: Usas `textContent` y luego `innerHTML` para escapar, y además sustituyes `"` por `&quot;`. Eso evita inyección en atributos (XSS).
- **Cierre del modal**: Compruebas `e.target === overlay` para cerrar solo al hacer clic en el fondo, no en el contenido.
- **IDs de tareas**: El uso de `nextTaskId()` con el máximo actual evita colisiones al añadir tareas.

---

## 2. ¿Se puede mejorar?

### 2.1 Código duplicado (DRY)

El patrón “abrir dropdown → cerrar al hacer clic fuera” se repite para el **menú de estado** y para el **menú de tres puntos**:

```javascript
// Se repite dos veces (status y menu)
const wasOpen = dropdown.classList.contains('is-open');
closeAllCardDropdowns();
if (!wasOpen) {
    dropdown.classList.add('is-open');
    const closeOnOutside = () => { ... };
    setTimeout(() => document.addEventListener('click', closeOnOutside), 0);
}
```

**Propuesta:** extraer una función, por ejemplo `openDropdown(dropdownElement, onClose)`, y usarla en ambos sitios. Así reduces duplicación y futuros fallos al cambiar la lógica en un solo sitio.

### 2.2 Números mágicos

Aparece varias veces un `setTimeout(..., 200)` para la duración de la animación:

- En `removeTaskCard`
- En `deleteSelectedTasks`

**Propuesta:** definir una constante al inicio del archivo, por ejemplo:

```javascript
const ANIMATION_DURATION_MS = 200;
```

y usarla en ambos `setTimeout`. Si algún día cambias la duración, solo tocas un sitio.

### 2.3 Función muy larga: `renderTaskCard`

`renderTaskCard` hace muchas cosas: crea la estructura del DOM, enlaza varios eventos (estado, menú, checkbox). Con el tiempo es más difícil de leer y de testear.

**Propuesta:** dividir en funciones más pequeñas, por ejemplo:

- `buildCardElement(task)` → devuelve el elemento de la tarjeta (sin eventos).
- `attachCardEvents(card, task)` → asigna todos los `addEventListener` de esa tarjeta.

El flujo quedaría: construir tarjeta → adjuntar eventos → añadir al DOM. Cada función tiene una responsabilidad clara.

### 2.4 Consistencia en fechas: `parseUserDate`

El usuario puede escribir solo números y tú formateas a `dd-mm-yyyy`. Si en otro flujo (por ejemplo, edición o importación) se usara `dd/mm/yyyy`, `parseUserDate` fallaría.

**Propuesta:** al inicio de `parseUserDate`, normalizar separadores:

```javascript
if (typeof dateString !== 'string') return null;
const normalized = dateString.trim().replace(/\//g, '-');
const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(normalized);
// ... resto igual
```

Así aceptas tanto `dd-mm-yyyy` como `dd/mm/yyyy` y evitas bugs sutiles.

### 2.5 Validación de `task` en `validateTask`

Si `task.dueDate` no fuera string (por un bug en otro sitio), `isValidDateInputValue` o `isPastDate` podrían comportarse raro.

**Propuesta:** una comprobación temprana:

```javascript
if (typeof task.dueDate !== 'string' || !task.dueDate.trim()) return 'La fecha es obligatoria.';
```

Refuerza el contrato “siempre string” y mensajes de error más claros.

---

## 3. Buenas prácticas que ya aplicas

- **JSDoc** en la mayoría de funciones: parámetros, retornos y descripción. Muy útil para quien lee y para el IDE.
- **Constantes con nombre** (`TASK_CATEGORIES`, `MAX_TITLE_LENGTH`, etc.) en lugar de números o textos sueltos.
- **Nombres descriptivos** en variables y funciones (`getTaskStatusLabel`, `closeAllCardDropdowns`, etc.).
- **Uso de `try/catch`** en `safeLoadJson` y `safeSaveJson` para no depender de que `localStorage` esté disponible o sea válido.
- **Accesibilidad**: `role="dialog"`, `aria-modal`, `aria-label` en botones y modal.
- **Comprobaciones de existencia** antes de usar nodos del DOM (`if (!taskListElement) return;`, `if (progressPercentEl)`, etc.).

---

## 4. Buenas prácticas que podrías aplicar

### 4.1 Documentar también `safeSaveJson`

Tiene el mismo nivel de importancia que `safeLoadJson`. Un JSDoc breve ayuda a mantener el mismo estándar en todo el archivo:

```javascript
/**
 * Guarda un valor en localStorage como JSON.
 * @param {string} key - Clave.
 * @param {*} value - Valor a serializar.
 * @returns {boolean} true si se guardó correctamente.
 */
function safeSaveJson(key, value) { ... }
```

### 4.2 Evitar mutar argumentos cuando no sea necesario

En `openEditModal` haces `Object.assign(task, updated)`, es decir, mutas el objeto `task` que viene de fuera. En una app pequeña está bien, pero como buena práctica se suele preferir **no mutar** y que la función que llama sea la que reemplace el elemento en el array, por ejemplo:

```javascript
const index = tasks.findIndex(t => t.id === task.id);
if (index !== -1) tasks[index] = { ...task, ...updated };
```

Así queda claro que el “origen de verdad” es el array `tasks`, no el objeto que se pasó por referencia.

### 4.3 Cache de filtros y DOM dinámico

`filterCheckboxesCache` se rellena una vez. Si en el futuro el HTML del sidebar se generara dinámicamente o se reemplazara, la caché quedaría desactualizada.

**Idea:** o bien no cachear y usar siempre `document.querySelectorAll(...)` (el coste suele ser bajo), o bien invalidar la caché cuando se modifique el sidebar. Para el código actual no es un error, pero es un punto a tener en cuenta si el DOM deja de ser estático.

### 4.4 Delegación de eventos (escalabilidad)

Ahora cada tarjeta tiene sus propios `addEventListener`. Con muchas tarjetas (cientos), eso son muchos listeners.

**Alternativa:** un solo listener en el contenedor (`#task-list`) y comprobar `event.target` (o `event.target.closest('.card-menu-btn')`, etc.) para saber qué tarjeta y qué botón se pulsó. No es obligatorio para una lista de tareas típica, pero es una buena práctica cuando el número de elementos crece.

---

## 5. Resumen

| Aspecto | Valoración |
|---------|------------|
| **Errores** | Ninguno grave. Solo un posible fallo con fechas en formato con `/` y una variable no usada. |
| **Mejoras** | Reducir duplicación (dropdowns), extraer constantes (animación), dividir `renderTaskCard`, robustecer `parseUserDate` y `validateTask`. |
| **Buenas prácticas** | Ya usas JSDoc, constantes, nombres claros, manejo de errores en storage y comprobaciones de nodos. Puedes sumar: documentar `safeSaveJson`, limitar mutación de `task`, y (opcional) delegación de eventos y gestión de caché si el DOM pasa a ser dinámico. |

En conjunto, el código es claro, ordenado y adecuado para un proyecto de este tamaño. Las mejoras propuestas son sobre todo para mantenerlo bien cuando crezca y para afianzar buenos hábitos (DRY, constantes, validaciones y documentación).
