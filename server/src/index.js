const express = require('express');
const app = express();
const { PORT } = require('./config/env');
const taskRoutes = require('./routes/task.routes');
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');

// Middlewares base
app.use(logger);
app.use(express.json());

// Prefijo para las rutas de tareas
app.use('/api/v1/tasks', taskRoutes);

// Handler de errores (siempre al final)
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});