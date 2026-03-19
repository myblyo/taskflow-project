const { Router } = require('express');
const {
    crearTarea,
    obtenerTodas,
    eliminarTarea
} = require('../controllers/task.controller');

const router = Router();

router.get('/', obtenerTodas);
router.post('/', crearTarea);
router.delete('/:id', eliminarTarea);

module.exports = router;
