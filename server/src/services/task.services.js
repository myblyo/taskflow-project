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
 * @param {{ title: string, description?: string, completed?: boolean, category?: string, priority?: string, dueDate?: string }} data
 * @returns {Object} La tarea creada.
 */
function crearTarea(data) {
    const completed = Boolean(data.completed);
    const status = data.status || (completed ? 'Completada' : 'Pendiente');
    const tarea = {
        id: Date.now().toString(),
        title: data.title,
        description: data.description ?? '',
        completed,
        status,
        category: data.category || 'Otro',
        priority: data.priority || 'Medio',
        dueDate: data.dueDate || '',
        creadaEn: new Date().toISOString()
    };

    tasks.push(tarea);
    return tarea;
}

/**
 * Actualiza una tarea por id (campos parciales).
 * @param {string} id
 * @param {Object} patch - title, description, category, priority, dueDate, status, completed
 */
function actualizarTarea(id, patch) {
    const index = tasks.findIndex((t) => String(t.id) === String(id));
    if (index === -1) {
        throw new Error('NOT_FOUND');
    }

    const cur = tasks[index];
    const next = { ...cur, ...patch };

    if (patch.status !== undefined) {
        next.status = patch.status;
        next.completed = patch.status === 'Completada';
    } else if (patch.completed !== undefined) {
        next.completed = Boolean(patch.completed);
        if (patch.completed) {
            next.status = 'Completada';
        } else if (cur.status === 'Completada') {
            next.status = 'Pendiente';
        }
    }

    tasks[index] = next;
    return next;
}

/**
 * Elimina una tarea por su ID.
 * @param {string} id - ID de la tarea a eliminar.
 * @returns {Object} La tarea eliminada.
 * @throws {Error} Si el ID no existe -> 'NOT_FOUND'.
 */
function eliminarTarea(id) {
    const index = tasks.findIndex((tarea) => String(tarea.id) === String(id));
    if (index === -1) {
        throw new Error('NOT_FOUND');
    }

    const [tareaEliminada] = tasks.splice(index, 1);
    return tareaEliminada;
}

module.exports = {
    obtenerTodas,
    crearTarea,
    actualizarTarea,
    eliminarTarea
};