const taskService = require('../services/task.services');

//Crear una nueva tarea
const crearTarea = async (req, res, next) => {
    const { title, description } = req.body;

    // Validación
    if (!title) {
        return next(new Error('FALTA_TITULO')); // Pasar error al middleware de errores
    }

    res.status(201).json({ message: 'Tarea creada exitosamente', data: { title, description }  });
};

//Obtener todas las tareas
const obtenerTodas = async (req, res) => {
    try {
        const tasks = await taskService.obtenerTodas();
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching tasks' });
    }
};

// Eliminar tarea
const eliminarTarea = async (req, res) => {
    try {
        const { id } = req.params;

        //Validación
        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'Task ID is required' });
        }

        // Llamar al servicio para eliminar la tarea
        const deletedTask = await taskService.eliminarTarea(id);

        if (!deletedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.status(204).send();

    } catch (error) {
        if (error.message === 'NOT_FOUND') {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(500).json({ error: 'An error occurred while deleting the task' });
    }
};

module.exports = {
    crearTarea,
    obtenerTodas,
    eliminarTarea,
};

