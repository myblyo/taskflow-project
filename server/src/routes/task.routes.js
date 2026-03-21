const express = require('express');
const router = express.Router();

const taskController = require('../controllers/task.controller');

// Ruta para crear una nueva tarea
router.post('/tasks', taskController.crearTarea);

// Ruta para obtener todas las tareas
router.get('/tasks', taskController.obtenerTodas);

// Ruta para eliminar una tarea
router.delete('/tasks/:id', taskController.eliminarTarea);

module.exports = router;