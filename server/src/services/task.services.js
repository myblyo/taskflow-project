let tasks = [];

/**
 * Retorna una copia de todas las tareas almacenadas.
 * @returns {Array} Lista de tareas.
 */
function obtenerTodas() {
    return [...tasks];
}

/**
 * Crea una nueva tarea y la agrega al array en memoria.
 * @param {{ title: string, description: string, completed?: boolean }} data
 * @returns {Object} La tarea creada.
 */
function crearTarea(data) {
    const tarea = {
        id: Date.now().toString(),
        title: data.title,
        description: data.description,
        completed: Boolean(data.completed),
        creadaEn: new Date().toISOString()
    };

    tasks.push(tarea);
    return tarea;
}

/**
 * Elimina una tarea por su ID.
 * @param {string} id - ID de la tarea a eliminar.
 * @returns {Object} La tarea eliminada.
 * @throws {Error} Si el ID no existe -> 'NOT_FOUND'.
 */
function eliminarTarea(id) {
    const index = tasks.findIndex((tarea) => tarea.id === id);
    if (index === -1) {
        throw new Error('NOT_FOUND');
    }

    const [tareaEliminada] = tasks.splice(index, 1);
    return tareaEliminada;
}

module.exports = {
    obtenerTodas,
    crearTarea,
    eliminarTarea
};