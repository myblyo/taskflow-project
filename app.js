/**
 * @typedef {Object} Task
 * @property {number} id
 * @property {string} title
 * @property {string} description
 * @property {string} category
 * @property {string} priority
 * @property {string} dueDate - Valor del input date (YYYY-MM-DD).
 * @property {boolean} completed
 */

// ── Constants ──
const PRIORITY_CLASS_MAP = { Alto: 'badge-alto', Medio: 'badge-medio', Bajo: 'badge-bajo' };
const TASK_CATEGORIES = ['Trabajo', 'Estudio', 'Personal', 'Otro'];
const TASK_PRIORITIES = ['Alto', 'Medio', 'Bajo'];
const MAX_TITLE_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 240;

// ── DOM references ──
const html = document.documentElement;
const darkToggle = document.getElementById('darkToggle');
const taskListElement = document.getElementById('task-list');
const taskForm = document.getElementById('task-form');
const resetBtn = document.getElementById('resetBtn');

/**
 * @returns {NodeListOf<HTMLInputElement>} Todos los checkboxes de filtros.
 */
function getFilterCheckboxes() {
    return document.querySelectorAll('.f-cat, .f-pri, .f-sta');
}

/**
 * Lee un valor JSON de localStorage de forma segura.
 * @template T
 * @param {string} key
 * @param {T} fallback
 * @returns {T}
 */
function safeLoadJson(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        return /** @type {T} */ (JSON.parse(raw));
    } catch {
        return fallback;
    }
}

/**
 * Guarda un valor JSON en localStorage de forma segura.
 * @param {string} key
 * @param {unknown} value
 * @returns {boolean} true si se guardó, false si falló.
 */
function safeSaveJson(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
}

/**
 * Inicializa el modo oscuro leyendo la preferencia guardada.
 * No lanza si el toggle no existe (robustez).
 * @returns {void}
 */
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

/**
 * Garantiza que el formulario tenga un contenedor de mensajes de error (aria-live).
 * @param {HTMLFormElement} formEl
 * @returns {HTMLDivElement}
 */
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

/**
 * Muestra un mensaje de error en el formulario.
 * @param {HTMLFormElement} formEl
 * @param {string} message
 * @returns {void}
 */
function showFormError(formEl, message) {
    const area = ensureFormMessageArea(formEl);
    area.textContent = message;
    area.style.display = '';
}

/**
 * Limpia el mensaje del formulario (si existe).
 * @param {HTMLFormElement} formEl
 * @returns {void}
 */
function clearFormMessage(formEl) {
    const area = formEl.querySelector('.form-message');
    if (!area) return;
    area.textContent = '';
    /** @type {HTMLElement} */ (area).style.display = 'none';
}

/**
 * Parsea una fecha en formato dd-mm-aaaa.
 * @param {string} dateString
 * @returns {Date|null}
 */
function parseUserDate(dateString) {
    const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(dateString);
    if (!match) return null;
    const [, dd, mm, yyyy] = match;
    const day = Number(dd);
    const month = Number(mm) - 1; // Date usa 0-11
    const year = Number(yyyy);
    const date = new Date(year, month, day);
    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month ||
        date.getDate() !== day
    ) {
        return null;
    }
    return date;
}

/**
 * Devuelve true si la fecha (dd-mm-aaaa) es válida.
 * @param {string} dateString
 * @returns {boolean}
 */
function isValidDateInputValue(dateString) {
    return parseUserDate(dateString) !== null;
}

/**
 * Devuelve true si la fecha es anterior a hoy (comparación por día, sin hora).
 * @param {string} dateString
 * @returns {boolean}
 */
function isPastDate(dateString) {
    const date = parseUserDate(dateString);
    if (!date) return false;
    const today = new Date();
    const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const userAtMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return userAtMidnight < todayAtMidnight;
}

/**
 * Construye el objeto Task a partir del formulario.
 * @returns {Task}
 */
function buildTaskFromForm() {
    return {
        id: Date.now(),
        title: document.getElementById('task-title').value.trim(),
        description: document.getElementById('task-desc').value.trim(),
        category: document.getElementById('category-select').value,
        priority: document.getElementById('priority-select').value,
        dueDate: document.getElementById('task-date').value,
        completed: false
    };
}

/**
 * Valida una tarea y devuelve un mensaje de error si aplica.
 * @param {Task} task
 * @returns {string|null}
 */
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

/**
 * Persiste el array de tareas.
 * @param {Task[]} taskList
 * @returns {void}
 */
function saveTasks(taskList) {
    safeSaveJson('tasks', taskList);
}

/**
 * Devuelve una etiqueta de estado compatible con los filtros actuales.
 * @param {Task} task
 * @returns {'Pendiente'|'Completada'}
 */
function getTaskStatusLabel(task) {
    return task.completed ? 'Completada' : 'Pendiente';
}

/**
 * Crea un elemento con clase(s) opcional(es).
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} tag
 * @param {string|string[]=} className
 * @returns {HTMLElementTagNameMap[K]}
 */
function createElement(tag, className) {
    const node = document.createElement(tag);
    if (Array.isArray(className)) node.classList.add(...className.filter(Boolean));
    else if (className) node.className = className;
    return node;
}

/**
 * Construye la sección de metadatos (categoría, prioridad, fecha) sin usar innerHTML.
 * @param {Task} task
 * @returns {HTMLDivElement}
 */
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

/**
 * Aplica los datasets usados por el filtrado al elemento card.
 * @param {HTMLElement} card
 * @param {Task} task
 * @returns {void}
 */
function setCardDatasets(card, task) {
    card.dataset.id = String(task.id);
    card.dataset.category = task.category;
    card.dataset.level = task.priority;
    card.dataset.status = getTaskStatusLabel(task);
}

/**
 * Maneja la animación y eliminación de una tarjeta + persistencia.
 * @param {HTMLElement} card
 * @param {number} taskId
 * @returns {void}
 */
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

/**
 * Renderiza una tarea como tarjeta y la inserta en la lista.
 * @param {Task} task
 * @returns {void}
 */
function renderTaskCard(task) {
    if (!taskListElement) return;

    const card = createElement('article', 'card-task');
    setCardDatasets(card, task);

    const cardInner = createElement('div', 'card2');

    const titleRow = createElement('h3', 'task-title');
    const checkbox = createElement('input', 'task-checkbox');
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

/**
 * Devuelve los valores seleccionados de un grupo de checkboxes.
 * @param {string} selector
 * @returns {string[]}
 */
function getCheckedValues(selector) {
    return [...document.querySelectorAll(selector)]
        .filter(input => input.checked)
        .map(input => input.value);
}

/**
 * Aplica los filtros: AND entre grupos (cat+prio+estado) y OR dentro de cada grupo.
 * @returns {void}
 */
function applyFilters() {
    const selected = {
        category: getCheckedValues('.f-cat'),
        priority: getCheckedValues('.f-pri'),
        status: getCheckedValues('.f-sta')
    };

    document.querySelectorAll('.card-task').forEach(card => {
        const okCategory = selected.category.length === 0 || selected.category.includes(card.dataset.category ?? '');
        const okPriority = selected.priority.length === 0 || selected.priority.includes(card.dataset.level ?? '');
        const okStatus = selected.status.length === 0 || selected.status.includes(card.dataset.status ?? '');
        card.style.display = (okCategory && okPriority && okStatus) ? '' : 'none';
    });
}

/**
 * Inicializa handlers de filtros y botón reset.
 * @returns {void}
 */
function initFilters() {
    getFilterCheckboxes().forEach(cb => cb.addEventListener('change', applyFilters));
    if (!resetBtn) return;
    resetBtn.addEventListener('click', () => {
        getFilterCheckboxes().forEach(cb => { cb.checked = false; });
        applyFilters();
    });
}

// ── App state ──
/** @type {Task[]} */
let tasks = safeLoadJson('tasks', []);

// ── Boot ──
initTheme();
initFilters();
tasks.forEach(renderTaskCard);

// ── Submit ──
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