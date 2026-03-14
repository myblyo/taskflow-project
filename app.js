/**
 * TaskFlow — Lista de tareas con filtros, tema claro/oscuro y persistencia en localStorage.
 *
 * Estructura: Constantes → DOM → Storage → Formulario → Fechas → DOM helpers → Tarjetas → Filtros → Estado → Boot
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
 */

// ── Constants ──
const PRIORITY_CLASS_MAP = { Alto: 'badge-alto', Medio: 'badge-medio', Bajo: 'badge-bajo' };
const TASK_CATEGORIES = ['Trabajo', 'Estudio', 'Personal', 'Otro'];
const TASK_PRIORITIES = ['Alto', 'Medio', 'Bajo'];
const MAX_TITLE_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 240;

const FILTER_SELECTORS = { category: '.f-cat', priority: '.f-pri', status: '.f-sta' };

// ── DOM references ──
const html = document.documentElement;
const darkToggle = document.getElementById('darkToggle');
const taskListElement = document.getElementById('task-list');
const taskForm = document.getElementById('task-form');
const resetBtn = document.getElementById('resetBtn');

/** Checkboxes de filtros cacheados (se rellenan en initFilters). */
let filterCheckboxesCache = null;

function getFilterCheckboxes() {
    if (!filterCheckboxesCache) {
        filterCheckboxesCache = document.querySelectorAll('.f-cat, .f-pri, .f-sta');
    }
    return filterCheckboxesCache;
}

// ── Storage ──
function safeLoadJson(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        return /** @type {typeof fallback} */ (JSON.parse(raw));
    } catch {
        return fallback;
    }
}

function safeSaveJson(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
}

// ── Theme ──
function initTheme() {
    const isDark = localStorage.getItem('theme') === 'dark';
    html.classList.toggle('dark', isDark);
    if (!darkToggle) return;
    darkToggle.checked = isDark;
    darkToggle.addEventListener('change', () => {
        html.classList.toggle('dark', darkToggle.checked);
        safeSaveJson('theme', darkToggle.checked ? 'dark' : 'light');
    });
}

// ── Form messages ──
function ensureFormMessageArea(formEl) {
    let area = formEl.querySelector('.form-message');
    if (area) return /** @type {HTMLDivElement} */ (area);
    area = createElement('div', 'form-message');
    area.setAttribute('role', 'alert');
    area.setAttribute('aria-live', 'polite');
    area.style.display = 'none';
    formEl.prepend(area);
    return area;
}

function showFormError(formEl, message) {
    const area = ensureFormMessageArea(formEl);
    area.textContent = message;
    area.style.display = '';
}

function clearFormMessage(formEl) {
    const area = formEl.querySelector('.form-message');
    if (!area) return;
    area.textContent = '';
    /** @type {HTMLElement} */ (area).style.display = 'none';
}

/** Valor de un input por id, o cadena vacía si no existe. */
function getFormValue(id) {
    const el = document.getElementById(id);
    return (el && el.value) ? String(el.value).trim() : '';
}

// ── Date validation ──
function parseUserDate(dateString) {
    const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(dateString);
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

function isValidDateInputValue(dateString) {
    return parseUserDate(dateString) !== null;
}

function isPastDate(dateString) {
    const date = parseUserDate(dateString);
    if (!date) return false;
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const inputStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return inputStart < todayStart;
}

// ── Task form & validation ──
function buildTaskFromForm() {
    return {
        id: nextTaskId(),
        title: getFormValue('task-title'),
        description: getFormValue('task-desc'),
        category: getFormValue('category-select'),
        priority: getFormValue('priority-select'),
        dueDate: getFormValue('task-date'),
        completed: false
    };
}

function validateTask(task) {
    if (typeof task.title !== 'string' || task.title.length === 0) return 'El título es obligatorio.';
    if (task.title.length > MAX_TITLE_LENGTH) return `El título no puede superar ${MAX_TITLE_LENGTH} caracteres.`;
    if (typeof task.description !== 'string') return 'La descripción no es válida.';
    if (task.description.length > MAX_DESCRIPTION_LENGTH) return `La descripción no puede superar ${MAX_DESCRIPTION_LENGTH} caracteres.`;
    if (!TASK_CATEGORIES.includes(task.category)) return 'Selecciona una categoría válida.';
    if (!TASK_PRIORITIES.includes(task.priority)) return 'Selecciona una prioridad válida.';
    if (!task.dueDate) return 'La fecha es obligatoria.';
    if (!isValidDateInputValue(task.dueDate)) return 'La fecha no tiene un formato válido.';
    if (isPastDate(task.dueDate)) return 'La fecha no puede ser anterior a hoy.';
    return null;
}

function getTaskStatusLabel(task) {
    return task.completed ? 'Completada' : 'Pendiente';
}

// ── DOM helpers ──
function createElement(tag, className) {
    const node = document.createElement(tag);
    if (Array.isArray(className)) node.classList.add(...className.filter(Boolean));
    else if (className) node.className = className;
    return node;
}

// ── Task cards ──
function createTaskMeta(task) {
    const meta = createElement('div', 'card-meta');
    const cat = createElement('span', ['badge', 'badge-cat']);
    cat.textContent = task.category;
    const pri = createElement('span', ['badge', PRIORITY_CLASS_MAP[task.priority] ?? '']);
    pri.textContent = task.priority;
    const date = createElement('span', 'task-date');
    date.textContent = `📅 ${task.dueDate}`;
    meta.append(cat, pri, date);
    return meta;
}

function setCardDatasets(card, task) {
    card.dataset.id = String(task.id);
    card.dataset.category = task.category;
    card.dataset.level = task.priority;
    card.dataset.status = getTaskStatusLabel(task);
}

function removeTaskCard(card, taskId) {
    card.style.transition = 'opacity 0.2s, transform 0.2s';
    card.style.opacity = '0';
    card.style.transform = 'translateY(-8px)';
    setTimeout(() => {
        card.remove();
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks(tasks);
    }, 200);
}

function renderTaskCard(task) {
    if (!taskListElement) return;

    const card = createElement('article', 'card-task');
    setCardDatasets(card, task);

    const cardInner = createElement('div', 'card2');
    const titleRow = createElement('h3', 'task-title');
    const checkbox = createElement('input', ['task-checkbox', 'checkbox']);
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;

    const label = createElement('label');
    label.append(checkbox, document.createTextNode(task.title));
    titleRow.appendChild(label);
    cardInner.appendChild(titleRow);

    if (task.description) {
        const desc = createElement('p', 'task-description');
        desc.textContent = task.description;
        cardInner.appendChild(desc);
    }

    const meta = createTaskMeta(task);
    const deleteBtn = createElement('button', 'delete-btn');
    deleteBtn.type = 'button';
    deleteBtn.textContent = ' × ';
    cardInner.append(meta, deleteBtn);
    card.appendChild(cardInner);

    checkbox.addEventListener('change', () => {
        const target = tasks.find(t => t.id === task.id);
        if (!target) return;
        target.completed = checkbox.checked;
        card.dataset.status = getTaskStatusLabel(target);
        saveTasks(tasks);
        applyFilters();
    });

    deleteBtn.addEventListener('click', () => removeTaskCard(card, task.id));
    taskListElement.appendChild(card);
}

// ── Filters ──
/** Valores seleccionados de un grupo de filtros (usa cache de nodos). */
function getCheckedFilterValues(group) {
    const selector = FILTER_SELECTORS[group];
    return [...getFilterCheckboxes()]
        .filter(el => el.matches(selector) && el.checked)
        .map(el => el.value);
}

function applyFilters() {
    const selected = {
        category: getCheckedFilterValues('category'),
        priority: getCheckedFilterValues('priority'),
        status: getCheckedFilterValues('status')
    };

    document.querySelectorAll('.card-task').forEach(card => {
        const okCategory = selected.category.length === 0 || selected.category.includes(card.dataset.category ?? '');
        const okPriority = selected.priority.length === 0 || selected.priority.includes(card.dataset.level ?? '');
        const okStatus = selected.status.length === 0 || selected.status.includes(card.dataset.status ?? '');
        card.style.display = (okCategory && okPriority && okStatus) ? '' : 'none';
    });
}

function initFilters() {
    getFilterCheckboxes().forEach(cb => cb.addEventListener('change', applyFilters));
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            getFilterCheckboxes().forEach(cb => { cb.checked = false; });
            applyFilters();
        });
    }
}

// ── State ──
/** @type {Task[]} */
let tasks = safeLoadJson('tasks', []);

let nextTaskIdValue = tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1;

function nextTaskId() {
    return nextTaskIdValue++;
}

function saveTasks(taskList) {
    safeSaveJson('tasks', taskList);
}

// ── Boot ──
initTheme();
initFilters();
tasks.forEach(renderTaskCard);

if (taskForm) {
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearFormMessage(taskForm);
        const task = buildTaskFromForm();
        const error = validateTask(task);
        if (error) {
            showFormError(taskForm, error);
            return;
        }
        tasks.push(task);
        saveTasks(tasks);
        renderTaskCard(task);
        taskForm.reset();
    });
}
