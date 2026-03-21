const express = require('express');
const router = express.Router();

const taskController = require('../controllers/task.controller');

router.post('/', taskController.crearTarea);
router.get('/', taskController.obtenerTodas);
router.delete('/:id', taskController.eliminarTarea);

module.exports = router;
