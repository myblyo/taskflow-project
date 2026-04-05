const taskService = require('../services/task.services');

const crearTarea = async (req, res, next) => {
    try {
        const { title, description, completed, category, priority, dueDate } = req.body;

        if (typeof title !== 'string' || !title.trim()) {
            return res.status(400).json({
                error: 'El título es obligatorio.'
            });
        }

        if (completed !== undefined && typeof completed !== 'boolean') {
            return res.status(400).json({
                error: 'Completed must be a boolean value.'
            });
        }

        const newTask = await taskService.crearTarea({
            title: title.trim(),
            description: typeof description === 'string' ? description : '',
            completed: completed ?? false,
            category,
            priority,
            dueDate
        });
        res.status(201).json(newTask);
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

const actualizarTarea = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, category, priority, dueDate, status, completed } = req.body;

        if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
            return res.status(400).json({ error: 'El título no puede estar vacío.' });
        }
        if (completed !== undefined && typeof completed !== 'boolean') {
            return res.status(400).json({ error: 'Completed debe ser booleano.' });
        }

        const patch = {
            ...(title !== undefined && { title: title.trim() }),
            ...(description !== undefined && { description: typeof description === 'string' ? description : '' }),
            ...(category !== undefined && { category }),
            ...(priority !== undefined && { priority }),
            ...(dueDate !== undefined && { dueDate }),
            ...(status !== undefined && { status }),
            ...(completed !== undefined && { completed })
        };

        const updated = taskService.actualizarTarea(id, patch);
        res.status(200).json(updated);
    } catch (error) {
        if (error.message === 'NOT_FOUND') {
            return res.status(404).json({ error: 'Task not found.' });
        }
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
        res.status(200).json({ message: 'tarea eliminada' });
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
    actualizarTarea,
    eliminarTarea
};
