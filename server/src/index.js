const express = require('express');
const app = express();
const { PORT } = require('./config/env');
const taskRoutes = require('./routes/task.routes');
const logger = require('./middlewares/logger');
const cors = require('cors');

// Middlewares base
app.use(logger);
app.use(express.json());
app.use(cors());

// Prefijo para las rutas de tareas
app.use('/api/v1/tasks', taskRoutes);

/**
 * Middleware final de errores (obligatorio: 4 argumentos para que Express lo reconozca).
 * Captura errores pasados con next(err) desde rutas/controladores.
 */
app.use((err, req, res, next) => {
    // 404n -> Ruta no encontrada
    if (err.message === 'NOT_FOUND') {
        return res.status(404).json({
            error: 'Recurso no encontrado'
        });
    }

    //400 -> Error de validación o datos incorrectos
    if (err.message === 'VALIDATION_ERROR') {
        return res.status(400).json({
            error: 'Datos de entrada no válidos'
        });
    }

    //Otros errores específicos pueden manejarse aquí con más condiciones...
    if (err.message === 'FALTA_TITULO') {
        return res.status(400).json({
            error: 'El título es requerido'
        });
    }

    //* Error inesperado o no manejado -> 500 Internal Server Error
    console.error(err);
    res.status(500).json({
        error: 'Internal server error'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});