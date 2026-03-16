# Prompt Engineering

## Introducción

Este documento recoge diferentes ejemplos de prompts utilizados para interactuar con herramientas de inteligencia artificial durante el desarrollo del proyecto. El objetivo es experimentar con distintas formas de formular instrucciones para obtener mejores resultados en generación de código, refactorización y documentación.

## Tipos de prompts utilizados

En este archivo se incluirán distintos tipos de prompts, entre ellos:

* Prompts donde se define un **rol específico** para la IA (por ejemplo: actuar como desarrollador senior).
* Prompts con **ejemplos previos** para guiar la respuesta (few-shot prompting).
* Prompts que solicitan **razonamiento paso a paso** para explicar soluciones.
* Prompts que incluyen **restricciones claras** sobre el formato o el contenido de la respuesta.

## Uso en el proyecto

Estos prompts se han utilizado para:

* Generar nuevas funciones en el código.
* Refactorizar funciones existentes para mejorar su estructura.
* Crear documentación del proyecto.
* Obtener explicaciones detalladas de partes del código.

## Objetivo

El objetivo de este documento es recopilar **al menos diez prompts útiles** que puedan reutilizarse en futuros proyectos.

Para cada prompt se explicará:

* El problema o tarea que se quería resolver.
* El prompt utilizado.
* El resultado obtenido.
* Por qué ese prompt funciona bien.

## Experimento 

### 1. Actúa como un desarrollador senior de software con experiencia en buenas prácticas, patrones de diseño y código limpio.

**Problema o tarea:**
Necesitaba mejorar la calidad del código y recibir sugerencias profesionales.

**Resultado obtenido:**
La IA generó código más estructurado, con nombres de variables más claros y separando mejor las responsabilidades.

**Por qué funciona bien:**
Asignar un rol específico hace que la IA responda con un enfoque más profesional y tenga en cuenta buenas prácticas de desarrollo.

### 2. Quiero que mis cards tengan el mismo estilo de checkbox que los definidos en checkbox.css. ¿Podrías generar un código que lo aplique?

**Problema o tarea:**
Aplicar el mismo estilo visual a diferentes componentes de la interfaz.

**Resultado obtenido:**
La IA generó código CSS y HTML que reutilizaba el estilo del checkbox existente.

**Por qué funciona bien:**
El prompt es claro y específico sobre el objetivo (aplicar un estilo concreto), lo que facilita que la IA genere una solución directa.

### 3. Refactoriza los files .js.

**Problema o tarea:**
Mejorar la organización del código JavaScript.

**Resultado obtenido:**
La IA reorganizó funciones, mejoró nombres de variables y eliminó código redundante.

**Por qué funciona bien:**
Pedir refactorización permite obtener una versión más limpia del código sin cambiar su funcionalidad.

### 4. Genera documentación para app.js usando comentarios tipo JSDoc.

Incluye:
* Descripción de la función
* Parámetros
* Valor de retorno


**Problema o tarea:**
Documentar el código para que sea más fácil de entender y mantener.

**Resultado obtenido:**
La IA generó comentarios JSDoc encima de cada función.

**Por qué funciona bien:**
El prompt incluye instrucciones claras sobre el formato de la respuesta.

### 5. @app.js:78-89 Explícame este código paso a paso.

**Problema o tarea:**
Entender una parte específica del código.

**Resultado obtenido:**
La IA explicó cada línea y su función dentro del programa.

**Por qué funciona bien:**
Pedir razonamiento paso a paso ayuda a comprender mejor la lógica del código.

### 6. Añade el porcentaje en grande de su progreso y abajo en letra un poco más pequeña los que ha completado y cuántas había.

Ejemplo: si había 8 y ha hecho 2 que se muestre así "2/8 tareas".

**Problema o tarea:**
Mostrar el progreso del usuario en la interfaz.

**Resultado obtenido:**
La IA generó una forma visual de mostrar el porcentaje y el número de tareas completadas.

**Por qué funciona bien:**
El prompt incluye un ejemplo claro del resultado esperado.

### 7. Actúa como un experto en UX/UI y mejora el diseño de la barra de progreso.

**Problema o tarea:**
Mejorar la experiencia visual del usuario.

**Resultado obtenido:**
La IA sugirió cambios en la estructura, espaciado y jerarquía visual.

**Por qué funciona bien:**
Asignar un rol especializado ayuda a obtener recomendaciones más enfocadas en diseño.

### 8. Actúa como un profesor de programación y revisa este código JavaScript.

**Problema o tarea:**
Quería saber si mi código tenía errores o podía mejorarse.

**Prompt utilizado:**
Actúa como un profesor de programación. Revisa el siguiente código JavaScript y dime:

* si hay errores
* si se puede mejorar
* qué buenas prácticas se podrían aplicar.

**Resultado obtenido:**
La IA analizó el código y dio sugerencias de mejora, como nombres de variables más claros, simplificación de funciones y mejor organización.

**Por qué funciona bien:**
Definir el rol de profesor hace que la IA no solo genere código, sino que también explique los errores y dé recomendaciones educativas.


### 9. En app.js, sepárame el código en módulos según su funcionalidad y sugiere nombres de ficheros apropiados para cada módulo. Indica claramente qué código va en cada archivo

**Problema o tarea:**
Tenía un archivo app.js muy grande y quería organizarlo en módulos más pequeños según la funcionalidad de cada parte, para mejorar la mantenibilidad y claridad del proyecto.

**Resultado obtenido:**
La IA analizó app.js, identificó funciones y secciones relacionadas

**Por qué funciona bien:**
* Permite organizar código de forma modular, mejorando la claridad y mantenibilidad.
* La IA entiende la funcionalidad de cada bloque y puede sugerir nombres coherentes para los ficheros.
* Es útil especialmente en proyectos grandes o cuando el archivo inicial es demasiado largo.

### 10. Resume este archivo de código en un máximo de 5 puntos explicando qué hace cada parte.

**Problema o tarea:**
Entender rápidamente un archivo largo.

**Resultado obtenido:**
La IA generó un resumen claro de la funcionalidad principal.

**Por qué funciona bien:**
La limitación de formato obliga a la IA a dar una respuesta más clara y directa.
