const taskService = require('../services/task.services');

/**
 * Acepta boolean real o valores típicos de Postman/form (string "true"/"false", 0/1).
 * @param {unknown} value
 * @returns {{ ok: true, value: boolean } | { ok: false, error: string }}
 */
function parseCompleted(value) {
    if (value === undefined || value === null || value === '') {
        return { ok: true, value: false };
    }
    if (typeof value === 'boolean') {
        return { ok: true, value };
    }
    if (typeof value === 'number' && (value === 0 || value === 1)) {
        return { ok: true, value: value === 1 };
    }
    if (typeof value === 'string') {
        const v = value.trim().toLowerCase();
        if (v === 'true' || v === '1' || v === 'sí' || v === 'si') return { ok: true, value: true };
        if (v === 'false' || v === '0' || v === 'no') return { ok: true, value: false };
    }
    return {
        ok: false,
        error: 'completed debe ser true/false (booleano), o "true"/"false", 0 o 1.'
    };
}

const crearTarea = async (req, res, next) => {
    try {
        const { title, description, completed } = req.body;

        const titleTrim = typeof title === 'string' ? title.trim() : '';
        const descTrim = typeof description === 'string' ? description.trim() : '';

        if (!titleTrim || !descTrim) {
            return res.status(400).json({
                error: 'Title and description are required.'
            });
        }

        const parsed = parseCompleted(completed);
        if (!parsed.ok) {
            return res.status(400).json({ error: parsed.error });
        }

        const newTask = await taskService.crearTarea({
            title: titleTrim,
            description: descTrim,
            completed: parsed.value
        });

        // Cabecera para comprobar en Postman (pestaña Headers) que es esta API
        res.set('X-TaskFlow-API', 'create-includes-id');

        res.status(201).json({
            message: 'Tarea creada. Copia el id para borrarla: DELETE /api/v1/tasks/:id',
            id: newTask.id,
            task: newTask
        });
    } catch (error) {
        next(error);
    }
};

const obtenerTodas = async (_req, res, next) => {
    try {
        const tasks = await taskService.obtenerTodas();
        res.status(200).json(tasks);
    } catch (error) {
        next(error);
    }
};

const eliminarTarea = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Task ID is required.' });
        }

        await taskService.eliminarTarea(id);
        res.status(204).send();
    } catch (error) {
        if (error.message === 'NOT_FOUND') {
            return res.status(404).json({ error: 'Task not found.' });
        }
        next(error);
    }
};

module.exports = {
    crearTarea,
    obtenerTodas,
    eliminarTarea
};
