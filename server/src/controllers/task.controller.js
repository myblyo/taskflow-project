const taskService = require('../services/task.services');

const crearTarea = async (req, res, next) => {
    try {
        const { title, description, completed } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                error: 'Title and description are required.'
            });
        }

        if (completed !== undefined && typeof completed !== 'boolean') {
            return res.status(400).json({
                error: 'Completed must be a boolean value.'
            });
        }

        const newTask = await taskService.crearTarea({
            title,
            description,
            completed: completed ?? false
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
