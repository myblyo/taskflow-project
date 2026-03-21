const express = require('express');
const router = express.Router();

const taskController = require('../controllers/task.controller');

// Ruta para crear una nueva tarea
router.post('/', taskController.crearTarea);

// Ruta para obtener todas las tareas
router.get('/', taskController.obtenerTodas);

// Ruta para eliminar una tarea
router.delete('/:id', taskController.eliminarTarea);

module.exports = router;


exports.eliminarTarea = (req, res, next) => {
    const { id } = req.params;

    const existeTarea = false; // Simulación de validación

    if (!existeTarea) {
        return  next(new Error('NOT_FOUND')); // Pasar error al middleware de errores
    }

    res.json({ message: 'Tarea eliminada exitosamente' });
};

exports.crearTarea = (req, res, next) => {
    const { title, description } = req.body;

    // Validación
    if (!title) {
        return next(new Error('FALTA_TITULO')); // Pasar error al middleware de errores
    }

    res.json({ message: 'Tarea creada exitosamente' });

};