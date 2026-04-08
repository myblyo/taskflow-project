const taskService = require('../services/task.services');
const { collectCreateTaskIssues } = require('../validation/createTaskBody');

const POST_BODY_HINT =
    'En Postman: Body → raw → JSON. Obligatorios: title, category, priority y dueDate (formato dd-mm-aaaa). ' +
    'Ejemplo: { "title": "Comprar leche", "category": "Personal", "priority": "Medio", "dueDate": "15-04-2026" }';

const crearTarea = async (req, res, next) => {
    try {
        const { title, description, completed, category, priority, dueDate, status } = req.body || {};

        const issues = collectCreateTaskIssues(req.body);
        if (issues.length > 0) {
            return res.status(400).json({
                error: issues.map((i) => i.message).join(' '),
                details: issues,
                hint: POST_BODY_HINT
            });
        }

        const payload = {
            title: title.trim(),
            description: typeof description === 'string' ? description : '',
            completed: completed ?? false,
            category: category.trim(),
            priority: priority.trim(),
            dueDate: dueDate.trim()
        };
        if (typeof status === 'string' && status.trim()) {
            payload.status = status.trim();
        }
        const newTask = await taskService.crearTarea(payload);
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
