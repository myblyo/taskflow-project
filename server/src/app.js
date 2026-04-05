const express = require('express');
const app = express();
const taskRoutes = require('./routes/task.routes');
const logger = require('./middlewares/logger');
const cors = require('cors');

app.use(logger);
app.use(express.json());
app.use(cors());

app.use('/api/v1/tasks', taskRoutes);

app.use((err, req, res, next) => {
    if (err.message === 'NOT_FOUND') {
        return res.status(404).json({
            error: 'Recurso no encontrado'
        });
    }

    if (err.message === 'VALIDATION_ERROR') {
        return res.status(400).json({
            error: 'Datos de entrada no válidos'
        });
    }

    if (err.message === 'FALTA_TITULO') {
        return res.status(400).json({
            error: 'El título es requerido'
        });
    }

    console.error(err);
    res.status(500).json({
        error: 'Internal server error'
    });
});

module.exports = app;
