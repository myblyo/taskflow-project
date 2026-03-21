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
    console.error(err);
    if (err.message === 'NOT_FOUND') {
        return res.status(404).json({ error: 'Task not found.' });
    }
    res.status(500).json({
        error: 'Internal server error'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});