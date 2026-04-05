# Backend y API — herramientas y conceptos

Documento orientado a **qué es** cada cosa y **para qué sirve** en un proyecto con API REST (como TaskFlow). Marca con `[x]` lo que ya hayas usado o integrado.

---

## Cliente HTTP, pruebas y calidad

- [ ] **Axios**

  **Qué es:** una librería de JavaScript para hacer peticiones HTTP desde el navegador o desde Node (`GET`, `POST`, etc.), alternativa a `fetch`.

  **Para qué sirve:** mismo rol que tu `fetch` en `js/api/client.js`: llamar al backend con URLs, cabeceras y cuerpo JSON. Axios añade interceptores, cancelación de peticiones y manejo unificado de errores en algunos equipos.

---

- [ ] **Postman**

  **Qué es:** aplicación (o extensión) para **probar APIs** sin escribir código: eliges método, URL, cabeceras y body, y ves status y respuesta.

  **Para qué sirve:** depurar `GET/POST/PATCH/DELETE` contra `http://localhost:3000/api/v1/tasks`, guardar colecciones de requests y compartirlas con el equipo.

---

- [ ] **Sentry**

  **Qué es:** servicio (SaaS) de **monitorización de errores**: captura excepciones en front o back, las agrupa y te muestra stack trace, contexto y frecuencia.

  **Para qué sirve:** saber en producción qué falla y para quién, sin depender solo de `console.error` en el servidor.

---

- [ ] **Swagger**

  **Qué es:** conjunto de herramientas alrededor de **OpenAPI**: describes tu API en un fichero YAML/JSON (rutas, parámetros, códigos de respuesta) y puedes generar **documentación interactiva** (Swagger UI) y a veces clientes de prueba.

  **Para qué sirve:** que cualquier desarrollador vea en una página web cómo es el contrato del API (endpoints, ejemplos) sin leer solo el código.


