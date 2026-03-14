# Cursor Workflow

## Resumen

Este documento describe cómo se utiliza **Cursor** en el desarrollo del proyecto **TaskFlow**. Recoge flujos de trabajo, atajos de teclado y ejemplos concretos en los que la IA integrada ha ayudado a entender, refactorizar y ampliar el código.

---

## Objetivo

- Registrar el uso de las herramientas de IA de Cursor durante el desarrollo.
- Servir de referencia para atajos y patrones de prompts que han dado buen resultado.
- Facilitar que cualquier persona del equipo pueda replicar o ampliar estos flujos.

---

## Estructura del documento

| Sección | Contenido |
|--------|------------|
| Atajos de teclado | Accesos rápidos más usados en Cursor |
| Chat contextual | Prompts y ejemplos con el chat (Ctrl+L) |
| Composer | Cambios multiarchivo y refactors guiados por IA |
| Autocompletado | Casos donde las sugerencias inline han ayudado |

---

## Atajos de teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl + L` | Abrir chat con la IA |
| `Ctrl + K` | Edición inline con IA (seleccionar texto y ejecutar) |
| `Ctrl + I` | Abrir Composer (cambios en varios archivos) |
| `Ctrl + `` ` | Abrir / cerrar terminal |
| `Tab` | Aceptar sugerencia de autocompletado |
| `Ctrl + Shift + Y` | Aceptar cambios propuestos por la IA |

*Nota: en macOS, sustituir `Ctrl` por `Cmd` donde aplique.*

---

## Chat contextual

Se usa el **chat** (Ctrl+L) para preguntas sobre el código, revisiones y sugerencias sin aplicar cambios directamente. Se pueden referenciar archivos con `@nombre-de-archivo` para dar contexto.

### Prompts utilizados

- **Revisión general de código**
  - *"Review this code and suggest improvements for readability, performance and structure."*
  - Útil para obtener un informe tipo code review antes de hacer refactors.

- **Explicación de una parte del código**
  - *"Explain what this function does and how it fits in the rest of the app."*
  - Ayuda a documentar o a entender lógica heredada.

- **Refactor concreto**
  - *"Refactor this function to improve legibility and add JSDoc for each function."*
  - Para mejorar nombres, extraer helpers y documentar sin cambiar el comportamiento.

- **Validaciones y errores**
  - *"Add validation and error messages for this form; keep it consistent with the rest of the project."*
  - Para centralizar validaciones y mensajes de error en formularios.

Cuando los prompts son claros y se incluye contexto (archivo o fragmento), las respuestas suelen ser más precisas y fáciles de aplicar.

---

## Composer

**Composer** (Ctrl+I) se usa cuando se quieren cambios que afectan a varios archivos (por ejemplo: renombrar una función en todo el proyecto, añadir validaciones en HTML + JS, o reorganizar CSS).

### Ejemplos de uso en TaskFlow

- Refactor de `app.js`: extracción de helpers, renombrado de funciones y variables, y añadido de JSDoc.
- Mejora del formulario: validaciones en JS, atributos en `index.html` y mensajes de error accesibles.
- Ajustes de documentación: reestructuración de `ai-comparison.md` y `cursor-workflow.md` (resúmenes, tablas, secciones claras).

Conviene describir el objetivo del cambio y, si hace falta, listar los archivos implicados para que Composer mantenga la coherencia entre ellos.

---

## Autocompletado con IA

El autocompletado inline (sugerencias grises al escribir) ayuda a completar funciones repetitivas, nombres de variables coherentes con el proyecto y bloques de código habituales (por ejemplo, `addEventListener`, validaciones simples).

En TaskFlow se ha usado sobre todo al escribir lógica en `app.js` y al redactar comentarios o JSDoc. Para aprovecharlo bien, conviene tener abierto el archivo correcto y escribir un inicio de línea que deje claro el contexto (nombre de función, parámetros, etc.).

---

## Próximos pasos

Este documento se puede ampliar con:

- Nuevos atajos o flujos que se usen con frecuencia.
- Prompts que hayan dado muy buen resultado (o que no convenga repetir).
- Ejemplos concretos de diffs o antes/después cuando sea útil para el equipo.
