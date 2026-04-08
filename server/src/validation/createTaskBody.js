const { TASK_CATEGORIES, TASK_PRIORITIES } = require('../constants/tasks');

function parseUserDate(dateString) {
    const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(String(dateString).trim());
    if (!match) return null;
    const [, dd, mm, yyyy] = match;
    const day = Number(dd);
    const month = Number(mm) - 1;
    const year = Number(yyyy);
    const date = new Date(year, month, day);
    if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
        return null;
    }
    return date;
}

function dueDateIssue(dueDate) {
    if (dueDate === undefined || dueDate === null) {
        return {
            field: 'dueDate',
            message: 'Falta añadir una fecha límite (dueDate).'
        };
    }
    if (typeof dueDate !== 'string') {
        return {
            field: 'dueDate',
            message: 'El campo dueDate debe ser texto con formato dd-mm-aaaa (ejemplo: 15-04-2026).'
        };
    }
    const trimmed = dueDate.trim();
    if (!trimmed) {
        return { field: 'dueDate', message: 'La fecha no puede estar vacía.' };
    }
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length < 8) {
        return {
            field: 'dueDate',
            message: 'La fecha debe tener día, mes y año completos en formato dd-mm-aaaa (8 números).'
        };
    }
    const date = parseUserDate(trimmed);
    if (!date) {
        return {
            field: 'dueDate',
            message: 'Esa fecha no existe en el calendario. Revisa día y mes.'
        };
    }
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const inputStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (inputStart < todayStart) {
        return { field: 'dueDate', message: 'La fecha no puede ser anterior a hoy.' };
    }
    return null;
}

/**
 * @param {object} body - req.body
 * @returns {{ field: string, message: string }[]}
 */
function collectCreateTaskIssues(body) {
    const issues = [];
    const { title, category, priority, dueDate, completed } = body || {};

    if (title === undefined || title === null) {
        issues.push({
            field: 'title',
            message: 'Falta añadir un título (title).'
        });
    } else if (typeof title !== 'string') {
        issues.push({
            field: 'title',
            message: 'El campo title debe ser texto (string).'
        });
    } else if (!title.trim()) {
        issues.push({
            field: 'title',
            message: 'El título no puede estar vacío ni solo espacios.'
        });
    }

    if (category === undefined || category === null) {
        issues.push({
            field: 'category',
            message: 'Falta añadir una categoría (category).'
        });
    } else if (typeof category !== 'string') {
        issues.push({
            field: 'category',
            message: 'El campo category debe ser texto.'
        });
    } else if (!category.trim()) {
        issues.push({
            field: 'category',
            message: 'La categoría no puede estar vacía.'
        });
    } else if (!TASK_CATEGORIES.includes(category.trim())) {
        issues.push({
            field: 'category',
            message: `Categoría no válida. Valores permitidos: ${TASK_CATEGORIES.join(', ')}.`
        });
    }

    if (priority === undefined || priority === null) {
        issues.push({
            field: 'priority',
            message: 'Falta añadir una prioridad (priority).'
        });
    } else if (typeof priority !== 'string') {
        issues.push({
            field: 'priority',
            message: 'El campo priority debe ser texto.'
        });
    } else if (!priority.trim()) {
        issues.push({
            field: 'priority',
            message: 'La prioridad no puede estar vacía.'
        });
    } else if (!TASK_PRIORITIES.includes(priority.trim())) {
        issues.push({
            field: 'priority',
            message: `Prioridad no válida. Valores permitidos: ${TASK_PRIORITIES.join(', ')}.`
        });
    }

    const dateErr = dueDateIssue(dueDate);
    if (dateErr) issues.push(dateErr);

    if (completed !== undefined && typeof completed !== 'boolean') {
        issues.push({
            field: 'completed',
            message: 'El campo completed debe ser true o false.'
        });
    }

    return issues;
}

module.exports = { collectCreateTaskIssues };
