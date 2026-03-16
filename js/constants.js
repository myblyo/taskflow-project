/**
 * Constantes y configuración global de la aplicación.
 * @module constants
 */

/**
 * @typedef {Object} Task
 * @property {number} id
 * @property {string} title
 * @property {string} description
 * @property {string} category
 * @property {string} priority
 * @property {string} dueDate - Formato dd-mm-aaaa
 * @property {boolean} completed
 * @property {'Pendiente'|'En progreso'|'Completada'} [status] - Estado (si falta se deriva de completed).
 */

export const PRIORITY_CLASS_MAP = { Alto: 'badge-alto', Medio: 'badge-medio', Bajo: 'badge-bajo' };
export const TASK_STATUSES = ['Pendiente', 'En progreso', 'Completada'];
export const STATUS_CLASS_MAP = {
    'Pendiente': 'badge-status-pendiente',
    'En progreso': 'badge-status-progreso',
    'Completada': 'badge-status-completada'
};
export const TASK_CATEGORIES = ['Trabajo', 'Estudio', 'Personal', 'Otro'];
export const TASK_PRIORITIES = ['Alto', 'Medio', 'Bajo'];
export const MAX_TITLE_LENGTH = 80;
export const MAX_DESCRIPTION_LENGTH = 240;
export const FILTER_SELECTORS = { category: '.f-cat', priority: '.f-pri', status: '.f-sta' };
