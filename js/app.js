/**
 * TaskFlow — Lista de tareas con filtros, tema claro/oscuro y datos desde API.
 *
 * Estructura: Constantes → DOM → Storage → Formulario → Fechas → DOM helpers → Tarjetas → Filtros → Estado → Boot
 *
 * @file app.js
 * @description Lógica principal: tareas, tarjetas, filtros, modo selección, barra de progreso, tema.
 *
 * Diseño editable desde otros archivos (no aquí):
 * - Categorías/prioridades/estados: TASK_CATEGORIES, TASK_PRIORITIES, TASK_STATUSES (textos y valores).
 * - Colores y aspecto de la UI: Componentes/*.css (card.css, maincnt.css, sidebar.css, etc.).
 * - Estructura HTML: index.html (clases e ids deben coincidir con los usados en este archivo).
 */
import { createTask, deleteTask, fetchTasks } from './api/client.js';

/**
 * @typedef {Object} Task
 * @property {string|number} id
 * @property {string} title
 * @property {string} description
 * @property {string} category
 * @property {string} priority
 * @property {string} dueDate - Formato dd-mm-aaaa
 * @property {boolean} completed
 * @property {'Pendiente'|'En progreso'|'Completada'} [status] - Estado de la tarea (si falta se deriva de completed).
 */

// ── Constants ──
const PRIORITY_CLASS_MAP = { Alto: 'badge-alto', Medio: 'badge-medio', Bajo: 'badge-bajo' };
const TASK_STATUSES = ['Pendiente', 'En progreso', 'Completada'];
const STATUS_CLASS_MAP = { 'Pendiente': 'badge-status-pendiente', 'En progreso': 'badge-status-progreso', 'Completada': 'badge-status-completada' };
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
const progressPercentEl = document.getElementById('progressPercent');
const progressFillEl = document.getElementById('progressFill');
const progressCountEl = document.getElementById('progressCount');
const progressBarEl = document.querySelector('.sidebar-progress-bar');
const selectModeBtn = document.getElementById('selectModeBtn');
const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');

/** Checkboxes de filtros cacheados (se rellenan en la primera llamada). */
let filterCheckboxesCache = null;

/** Modo selección múltiple para borrar varias tareas a la vez. */
let isSelectMode = false;
/** Set de ids de tareas seleccionadas (solo en modo selección). */
let selectedIds = new Set();

/**
 * Devuelve los checkboxes de filtros (categoría, prioridad, estado). Usa cache para no repetir querySelectorAll.
 * @returns {NodeListOf<Element>} Lista de nodos de los checkboxes de filtros.
 */
function getFilterCheckboxes() {
    if (!filterCheckboxesCache) {
        filterCheckboxesCache = document.querySelectorAll('.f-cat, .f-pri, .f-sta');
    }
    return filterCheckboxesCache;
}

// ── Theme ──
/**
 * Inicializa el tema claro/oscuro de la sesión actual.
 * @returns {void}
 */
function initTheme() {
    if (!darkToggle) return;
    darkToggle.addEventListener('change', () => {
        html.classList.toggle('dark', darkToggle.checked);
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

/**
 * Muestra un mensaje de error en el área de mensajes del formulario.
 * @param {HTMLFormElement} formEl - Formulario que contiene o recibirá el área .form-message.
 * @param {string} message - Texto del mensaje de error.
 * @returns {void}
 */
function showFormError(formEl, message) {
    const area = ensureFormMessageArea(formEl);
    area.textContent = message;
    area.style.display = '';
}

/**
 * Limpia y oculta el mensaje de error del formulario si existe el área .form-message.
 * @param {HTMLFormElement} formEl - Formulario cuyo mensaje se quiere limpiar.
 * @returns {void}
 */
function clearFormMessage(formEl) {
    const area = formEl.querySelector('.form-message');
    if (!area) return;
    area.textContent = '';
    /** @type {HTMLElement} */ (area).style.display = 'none';
}

function ensureNetworkStateArea() {
    if (!taskListElement || !taskListElement.parentElement) return null;
    let area = document.getElementById('network-state');
    if (area) return area;
    area = createElement('div', 'form-message');
    area.id = 'network-state';
    area.setAttribute('role', 'status');
    area.setAttribute('aria-live', 'polite');
    area.style.display = 'none';
    taskListElement.parentElement.insertBefore(area, taskListElement);
    return area;
}

function showNetworkState(message, isError = false) {
    const area = ensureNetworkStateArea();
    if (!area) return;
    area.textContent = message;
    area.style.display = '';
    area.style.color = isError ? '#b91c1c' : '';
}

function hideNetworkState() {
    const area = document.getElementById('network-state');
    if (!area) return;
    area.textContent = '';
    area.style.display = 'none';
}

/**
 * Obtiene el valor de un campo del formulario por su id. Devuelve cadena vacía si el elemento no existe.
 * @param {string} id - Id del elemento input/select.
 * @returns {string} Valor recortado (trim) o ''.
 */
function getFormValue(id) {
    const el = document.getElementById(id);
    return (el && el.value) ? String(el.value).trim() : '';
}

// ── Date validation ──
/**
 * Formatea una cadena de solo dígitos a dd-mm-yyyy (máx. 8 dígitos). El usuario solo escribe números.
 * @param {string} str - Valor actual del input (puede llevar guiones o solo números).
 * @returns {string} Cadena formateada tipo "dd-mm-yyyy" o incompleta "dd", "dd-mm", etc.
 */
function formatDateInputFromDigits(str) {
    const digits = (String(str || '').replace(/\D/g, '')).slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return digits.slice(0, 2) + '-' + digits.slice(2);
    return digits.slice(0, 2) + '-' + digits.slice(2, 4) + '-' + digits.slice(4);
}

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

/**
 * Indica si una cadena es una fecha válida en formato dd-mm-aaaa.
 * @param {string} dateString - Cadena a validar.
 * @returns {boolean} true si es válida, false en caso contrario.
 */
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

/**
 * Valida la fecha del formulario: 8 dígitos (DDMMAAAA), fecha de calendario real y no pasada.
 * @param {string} dueDate - Valor del input (con guiones insertados automáticamente).
 * @returns {string|null} Mensaje de error o null si es válida.
 */
function getDueDateValidationError(dueDate) {
    const trimmed = typeof dueDate === 'string' ? dueDate.trim() : '';
    if (!trimmed) return 'La fecha es obligatoria.';
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length < 8) {
        return 'Escribe 8 números (día, mes y año). Los guiones se ponen solos.';
    }
    if (!isValidDateInputValue(trimmed)) {
        return 'Esa fecha no existe en el calendario. Revisa día y mes.';
    }
    if (isPastDate(trimmed)) return 'La fecha no puede ser anterior a hoy.';
    return null;
}

// ── Task form & validation ──
/**
 * Construye un objeto Task a partir de los valores actuales del formulario.
 * @returns {Task} Objeto tarea con los datos del formulario (strings vacíos si falta algún campo).
 */
function buildTaskFromForm() {
    return {
        title: getFormValue('task-title'),
        description: getFormValue('task-desc'),
        category: getFormValue('category-select'),
        priority: getFormValue('priority-select'),
        dueDate: getFormValue('task-date'),
        completed: false,
        status: 'Pendiente'
    };
}

function validateTask(task) {
    if (typeof task.title !== 'string' || task.title.length === 0) return 'El título es obligatorio.';
    if (task.title.length > MAX_TITLE_LENGTH) return `El título no puede superar ${MAX_TITLE_LENGTH} caracteres.`;
    if (typeof task.description !== 'string') return 'La descripción no es válida.';
    if (task.description.length > MAX_DESCRIPTION_LENGTH) return `La descripción no puede superar ${MAX_DESCRIPTION_LENGTH} caracteres.`;
    if (!TASK_CATEGORIES.includes(task.category)) return 'Selecciona una categoría válida.';
    if (!TASK_PRIORITIES.includes(task.priority)) return 'Selecciona una prioridad válida.';
    const dateErr = getDueDateValidationError(task.dueDate);
    if (dateErr) return dateErr;
    return null;
}

/**
 * Devuelve la etiqueta de estado usada en los filtros (Pendiente, En progreso, Completada).
 * @param {Task} task - Tarea de la que obtener el estado.
 * @returns {'Pendiente'|'En progreso'|'Completada'}
 */
function getTaskStatusLabel(task) {
    if (task.status && TASK_STATUSES.includes(task.status)) return task.status;
    return task.completed ? 'Completada' : 'Pendiente';
}

// ── DOM helpers ──
/**
 * Crea un elemento DOM con opcionalmente una o varias clases.
 * @param {K} tag - Nombre de la etiqueta (ej. 'div', 'span').
 * @param {string|string[]} [className] - Clase única o array de clases (los falsy se ignoran).
 * @returns {HTMLElementTagNameMap[K]} El elemento creado.
 * @template {keyof HTMLElementTagNameMap} K
 */
function createElement(tag, className) {
    const node = document.createElement(tag);
    if (Array.isArray(className)) node.classList.add(...className.filter(Boolean));
    else if (className) node.className = className;
    return node;
}

// ── Task cards ──
/**
 * Construye el bloque de metadatos de una tarjeta (categoría, prioridad, fecha) como nodos DOM, sin innerHTML.
 * @param {Task} task - Tarea de la que tomar categoría, prioridad y dueDate.
 * @returns {HTMLDivElement} Contenedor div.card-meta con los spans correspondientes.
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
 * Rellena los data-* del elemento card para que applyFilters pueda evaluar categoría, prioridad y estado.
 * @param {HTMLElement} card - Elemento de la tarjeta (ej. article.card-task).
 * @param {Task} task - Tarea con los datos a escribir en dataset.
 * @returns {void}
 */
function setCardDatasets(card, task) {
    card.dataset.id = String(task.id);
    card.dataset.category = task.category;
    card.dataset.level = task.priority;
    card.dataset.status = getTaskStatusLabel(task);
}

/**
 * Cierra todos los desplegables de menú de tarjetas abiertos.
 * @returns {void}
 */
function closeAllCardDropdowns() {
    document.querySelectorAll('.card-dropdown.is-open').forEach(d => d.classList.remove('is-open'));
}

/**
 * Actualiza el contenido visible de una tarjeta (título, descripción, meta y datasets) sin recrear el nodo.
 * @param {HTMLElement} card - Article de la tarjeta.
 * @param {Task} task - Tarea con los datos ya actualizados.
 * @returns {void}
 */
function updateCardContent(card, task) {
    setCardDatasets(card, task);
    const titleRow = card.querySelector('.task-title');
    if (titleRow) titleRow.classList.toggle('is-completed', task.completed);
    const label = card.querySelector('.task-title label');
    if (label && label.lastChild) label.lastChild.textContent = task.title;
    const statusTrigger = card.querySelector('.card-status-wrap button.badge-status');
    if (statusTrigger) {
        const statusLabel = getTaskStatusLabel(task);
        statusTrigger.textContent = statusLabel;
        statusTrigger.className = 'badge badge-status ' + (STATUS_CLASS_MAP[statusLabel] || 'badge-status-pendiente');
    }
    const cardCheckbox = card.querySelector('.task-checkbox');
    if (cardCheckbox && !isSelectMode) cardCheckbox.checked = task.completed;
    const card2 = card.querySelector('.card2');
    const descEl = card2?.querySelector('.task-description');
    if (task.description) {
        if (descEl) descEl.textContent = task.description;
        else if (titleRow) {
            const desc = createElement('p', 'task-description');
            desc.textContent = task.description;
            titleRow.insertAdjacentElement('afterend', desc);
        }
    } else if (descEl) descEl.remove();
    const metaContainer = card.querySelector('.card-meta');
    if (metaContainer) {
        const newMeta = createTaskMeta(task);
        metaContainer.replaceWith(newMeta);
    }
}

/**
 * Abre el modal de edición con los datos de la tarea. Al guardar, actualiza la tarea, la tarjeta y cierra el modal.
 * @param {Task} task - Tarea a editar (se modifica en el array tasks).
 * @param {HTMLElement} card - Tarjeta asociada para refrescar su contenido.
 * @returns {void}
 */
function openEditModal(task, card) {
    const overlay = createElement('div', 'modal-overlay');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Editar tarea');

    const modal = createElement('div', 'modal-edit');
    modal.innerHTML = `
        <h2>Editar tarea</h2>
        <div class="form-message" role="alert" style="display:none;"></div>
        <div class="row">
            <input type="text" id="edit-task-title" class="flex-1" placeholder="Título" value="${escapeAttr(task.title)}" maxlength="${MAX_TITLE_LENGTH}">
            <select id="edit-category">
                ${TASK_CATEGORIES.map(c => `<option value="${escapeAttr(c)}" ${c === task.category ? 'selected' : ''}>${escapeAttr(c)}</option>`).join('')}
            </select>
            <select id="edit-priority">
                ${TASK_PRIORITIES.map(p => `<option value="${escapeAttr(p)}" ${p === task.priority ? 'selected' : ''}>${escapeAttr(p)}</option>`).join('')}
            </select>
            <select id="edit-status">
                ${TASK_STATUSES.map(s => `<option value="${escapeAttr(s)}" ${s === getTaskStatusLabel(task) ? 'selected' : ''}>${escapeAttr(s)}</option>`).join('')}
            </select>
        </div>
        <div class="row">
            <input type="text" id="edit-task-desc" class="flex-1" placeholder="Descripción (opcional)" value="${escapeAttr(task.description || '')}" maxlength="${MAX_DESCRIPTION_LENGTH}">
            <input type="text" id="edit-task-date" placeholder="DDMMAAAA (solo números)" maxlength="10" inputmode="numeric" value="${escapeAttr(task.dueDate)}">
        </div>
        <div class="modal-actions">
            <button type="button" class="btn-secondary modal-cancel">Cancelar</button>
            <button type="button" class="btn-primary modal-save">Guardar</button>
        </div>
    `;
    overlay.appendChild(modal);

    const msgEl = modal.querySelector('.form-message');
    const titleEl = modal.querySelector('#edit-task-title');
    const descEl = modal.querySelector('#edit-task-desc');
    const categoryEl = modal.querySelector('#edit-category');
    const priorityEl = modal.querySelector('#edit-priority');
    const statusEl = modal.querySelector('#edit-status');
    const dateEl = modal.querySelector('#edit-task-date');
    bindDateInputFormat(dateEl);

    function closeModal() {
        overlay.setAttribute('aria-hidden', 'true');
        overlay.style.display = 'none';
        document.body.removeChild(overlay);
        document.removeEventListener('click', closeOnClickOutside);
    }

    function closeOnClickOutside(e) {
        if (e.target === overlay) closeModal();
    }

    overlay.querySelector('.modal-cancel').addEventListener('click', closeModal);
    overlay.querySelector('.modal-save').addEventListener('click', () => {
        const newStatus = (statusEl && statusEl.value && TASK_STATUSES.includes(statusEl.value)) ? statusEl.value : getTaskStatusLabel(task);
        const updated = {
            id: task.id,
            title: (titleEl && titleEl.value) ? titleEl.value.trim() : '',
            description: (descEl && descEl.value) ? descEl.value.trim() : '',
            category: (categoryEl && categoryEl.value) ? categoryEl.value : '',
            priority: (priorityEl && priorityEl.value) ? priorityEl.value : '',
            dueDate: (dateEl && dateEl.value) ? dateEl.value.trim() : '',
            completed: (newStatus === 'Completada'),
            status: newStatus
        };
        const err = validateTask(updated);
        if (err) {
            if (msgEl) { msgEl.textContent = err; msgEl.style.display = ''; }
            return;
        }
        Object.assign(task, updated);
        saveTasks(tasks);
        updateCardContent(card, task);
        closeModal();
    });

    document.body.appendChild(overlay);
    document.addEventListener('click', closeOnClickOutside);
}

/**
 * Escapa una cadena para usarla como valor de atributo HTML (evita comillas y &).
 * @param {string} str
 * @returns {string}
 */
function escapeAttr(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML.replace(/"/g, '&quot;');
}

function removeTaskCard(card, taskId) {
    deleteTask(taskId)
        .then(() => {
            selectedIds.delete(taskId);
            updateDeleteSelectedState();
            card.style.transition = 'opacity 0.2s, transform 0.2s';
            card.style.opacity = '0';
            card.style.transform = 'translateY(-8px)';
            setTimeout(() => {
                card.remove();
                tasks = tasks.filter(t => t.id !== taskId);
                saveTasks(tasks);
            }, 200);
        })
        .catch((error) => {
            showNetworkState(error.message || 'No se pudo eliminar la tarea.', true);
        });
}

/**
 * Crea el DOM de una tarjeta de tarea (menú de tres puntos a la izquierda con Editar/Borrar, título con checkbox, descripción, meta).
 * @param {Task} task - Tarea a renderizar.
 * @returns {void}
 */
function renderTaskCard(task) {
    if (!taskListElement) return;

    const card = createElement('article', 'card-task');
    setCardDatasets(card, task);

    const cardInner = createElement('div', 'card2');
    const topRow = createElement('div', 'card2-top');

    const titleRow = createElement('h3', 'task-title');
    if (task.completed) titleRow.classList.add('is-completed');
    const checkbox = createElement('input', ['task-checkbox', 'checkbox']);
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    const label = createElement('label');
    label.append(checkbox, document.createTextNode(task.title));
    titleRow.appendChild(label);
    topRow.appendChild(titleRow);

    const statusLabel = getTaskStatusLabel(task);
    const statusWrap = createElement('div', 'card-status-wrap');
    const statusTrigger = createElement('button', ['badge', 'badge-status', STATUS_CLASS_MAP[statusLabel] || 'badge-status-pendiente']);
    statusTrigger.type = 'button';
    statusTrigger.setAttribute('aria-label', 'Cambiar estado');
    statusTrigger.textContent = statusLabel;
    const statusDropdown = createElement('div', 'card-dropdown');
    TASK_STATUSES.forEach(s => {
        const opt = createElement('button', 'card-dropdown-option');
        opt.type = 'button';
        opt.textContent = s;
        opt.dataset.status = s;
        statusDropdown.appendChild(opt);
    });
    statusWrap.append(statusTrigger, statusDropdown);
    topRow.appendChild(statusWrap);

    const menu = createElement('div', 'card-menu');
    const menuBtn = createElement('button', 'card-menu-btn');
    menuBtn.type = 'button';
    menuBtn.setAttribute('aria-label', 'Abrir menú');
    menuBtn.textContent = '⋮';
    const dropdown = createElement('div', 'card-dropdown');
    const optEdit = createElement('button', 'card-dropdown-option');
    optEdit.type = 'button';
    optEdit.textContent = 'Editar';
    const optDelete = createElement('button', 'card-dropdown-option card-dropdown-option--danger');
    optDelete.type = 'button';
    optDelete.textContent = 'Borrar';
    dropdown.append(optEdit, optDelete);
    menu.append(menuBtn, dropdown);
    topRow.appendChild(menu);

    cardInner.appendChild(topRow);

    if (task.description) {
        const desc = createElement('p', 'task-description');
        desc.textContent = task.description;
        cardInner.appendChild(desc);
    }

    const meta = createTaskMeta(task);
    cardInner.appendChild(meta);
    card.appendChild(cardInner);

    statusTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasOpen = statusDropdown.classList.contains('is-open');
        closeAllCardDropdowns();
        if (!wasOpen) {
            statusDropdown.classList.add('is-open');
            const closeOnOutside = () => {
                closeAllCardDropdowns();
                document.removeEventListener('click', closeOnOutside);
            };
            setTimeout(() => document.addEventListener('click', closeOnOutside), 0);
        }
    });
    statusDropdown.querySelectorAll('.card-dropdown-option').forEach(opt => {
        opt.addEventListener('click', (e) => {
            e.stopPropagation();
            const newStatus = opt.dataset.status;
            if (!newStatus || !TASK_STATUSES.includes(newStatus)) return;
            const target = tasks.find(t => t.id === task.id);
            if (!target) return;
            target.status = newStatus;
            target.completed = (newStatus === 'Completada');
            statusDropdown.classList.remove('is-open');
            statusTrigger.textContent = newStatus;
            statusTrigger.className = 'badge badge-status ' + (STATUS_CLASS_MAP[newStatus] || 'badge-status-pendiente');
            checkbox.checked = target.completed;
            titleRow.classList.toggle('is-completed', target.completed);
            setCardDatasets(card, target);
            saveTasks(tasks);
            applyFilters();
        });
    });

    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasOpen = dropdown.classList.contains('is-open');
        closeAllCardDropdowns();
        if (!wasOpen) {
            dropdown.classList.add('is-open');
            const closeOnOutside = () => {
                closeAllCardDropdowns();
                document.removeEventListener('click', closeOnOutside);
            };
            setTimeout(() => document.addEventListener('click', closeOnOutside), 0);
        }
    });
    optEdit.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.remove('is-open');
        openEditModal(task, card);
    });
    optDelete.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.remove('is-open');
        removeTaskCard(card, task.id);
    });

    checkbox.addEventListener('change', () => {
        if (isSelectMode) {
            const id = task.id;
            if (selectedIds.has(id)) selectedIds.delete(id);
            else selectedIds.add(id);
            card.classList.toggle('is-selected', selectedIds.has(id));
            updateDeleteSelectedState();
            return;
        }
        const target = tasks.find(t => t.id === task.id);
        if (!target) return;
        target.completed = checkbox.checked;
        target.status = target.completed ? 'Completada' : 'Pendiente';
        card.dataset.status = getTaskStatusLabel(target);
        statusTrigger.textContent = target.status;
        statusTrigger.className = 'badge badge-status ' + (STATUS_CLASS_MAP[target.status] || 'badge-status-pendiente');
        titleRow.classList.toggle('is-completed', target.completed);
        saveTasks(tasks);
        applyFilters();
    });

    taskListElement.appendChild(card);
}

// ── Filters ──
/**
 * Devuelve los valores seleccionados de un grupo de filtros (categoría, prioridad o estado). Usa el cache de checkboxes.
 * @param {'category'|'priority'|'status'} group - Grupo de filtro según FILTER_SELECTORS.
 * @returns {string[]} Valores (value) de los checkboxes marcados de ese grupo.
 */
function getCheckedFilterValues(group) {
    const selector = FILTER_SELECTORS[group];
    return [...getFilterCheckboxes()]
        .filter(el => el.matches(selector) && el.checked)
        .map(el => el.value);
}

/**
 * Muestra u oculta cada tarjeta según los filtros activos: AND entre grupos (cat + prioridad + estado), OR dentro de cada grupo.
 * @returns {void}
 */
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

/**
 * Enlaza los eventos change de los checkboxes de filtros a applyFilters y el click del botón reset para desmarcar y reaplicar.
 * @returns {void}
 */
function initFilters() {
    getFilterCheckboxes().forEach(cb => cb.addEventListener('change', applyFilters));
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            getFilterCheckboxes().forEach(cb => { cb.checked = false; });
            applyFilters();
        });
    }
}

/**
 * Hace que un input de fecha solo acepte dígitos al escribir; inserta guiones como dd-mm-aaaa.
 * @param {HTMLInputElement} inputEl - Input con id task-date o edit-task-date.
 * @returns {void}
 */
function bindDateInputFormat(inputEl) {
    if (!inputEl) return;
    inputEl.setAttribute('inputmode', 'numeric');
    inputEl.setAttribute('maxlength', '10');
    inputEl.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        const allowedNav = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
        if (allowedNav.includes(e.key)) return;
        if (e.key.length === 1 && !/\d/.test(e.key)) {
            e.preventDefault();
        }
    });
    inputEl.addEventListener('input', () => {
        inputEl.value = formatDateInputFromDigits(inputEl.value);
    });
}

// ── State ──
/** @type {Task[]} */
let tasks = [];

/**
 * Mantiene estado y actualiza el progreso visual.
 * @param {Task[]} taskList - Array de tareas a guardar.
 * @returns {void}
 */
function saveTasks(taskList) {
    tasks = taskList;
    updateProgress();
}

/**
 * Actualiza la barra de progreso del sidebar: porcentaje, barra y texto "completadas/total tareas".
 * @returns {void}
 */
function updateProgress() {
    if (!progressPercentEl || !progressFillEl || !progressCountEl) return;
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completada' || t.completed).length;
    const percent = total ? Math.round((completed / total) * 100) : 0;
    progressPercentEl.textContent = percent + '%';
    progressFillEl.style.width = percent + '%';
    progressCountEl.textContent = completed + '/' + total + ' tareas';
    if (progressBarEl) {
        progressBarEl.setAttribute('aria-valuenow', percent);
    }
}

/**
 * Activa o desactiva el modo selección. Al salir, limpia la selección y desmarca los checkboxes de las cartas.
 * @param {boolean} on - true para activar modo selección.
 * @returns {void}
 */
function setSelectMode(on) {
    isSelectMode = on;
    document.body.classList.toggle('select-mode', on);
    if (!on) {
        selectedIds.clear();
        document.querySelectorAll('.card-task .task-checkbox').forEach(cb => { cb.checked = false; });
        document.querySelectorAll('.card-task.is-selected').forEach(c => c.classList.remove('is-selected'));
    }
    if (selectModeBtn) {
        selectModeBtn.textContent = on ? 'Cancelar' : 'Seleccionar';
        selectModeBtn.classList.toggle('is-active', on);
    }
    updateDeleteSelectedState();
}

/**
 * Actualiza el estado del botón "Borrar seleccionadas" (disabled si no hay ninguna seleccionada, rojo si hay selección).
 * @returns {void}
 */
function updateDeleteSelectedState() {
    if (!deleteSelectedBtn) return;
    const hasSelection = selectedIds.size > 0;
    deleteSelectedBtn.disabled = !hasSelection;
    deleteSelectedBtn.classList.toggle('has-selection', hasSelection);
}

/**
 * Borra todas las tareas seleccionadas, anima la salida de las cartas y sale del modo selección.
 * @returns {void}
 */
function deleteSelectedTasks() {
    if (selectedIds.size === 0) return;
    const idsToRemove = new Set(selectedIds);
    Promise.allSettled([...idsToRemove].map((id) => deleteTask(id)))
        .then((results) => {
            const failed = results.filter((result) => result.status === 'rejected').length;
            if (failed > 0) {
                showNetworkState(`No se pudieron eliminar ${failed} tarea(s).`, true);
            } else {
                hideNetworkState();
            }
            tasks = tasks.filter(t => !idsToRemove.has(String(t.id)));
            selectedIds.clear();
            document.querySelectorAll('.card-task').forEach((card) => {
                if (idsToRemove.has(card.dataset.id || '')) card.remove();
            });
            saveTasks(tasks);
            setSelectMode(false);
        });
}

// ── Boot ──
initTheme();
initFilters();
bindDateInputFormat(document.getElementById('task-date'));
showNetworkState('Cargando tareas...');
fetchTasks()
    .then((serverTasks) => {
        hideNetworkState();
        tasks = serverTasks.map((task) => ({
            ...task,
            category: task.category || 'Otro',
            priority: task.priority || 'Medio',
            dueDate: task.dueDate || '01-01-2099',
            status: task.completed ? 'Completada' : 'Pendiente'
        }));
        tasks.forEach(renderTaskCard);
        updateProgress();
    })
    .catch((error) => {
        showNetworkState(`Error al cargar tareas: ${error.message}`, true);
        updateProgress();
    });

if (selectModeBtn) {
    selectModeBtn.addEventListener('click', () => setSelectMode(!isSelectMode));
}
if (deleteSelectedBtn) {
    deleteSelectedBtn.addEventListener('click', deleteSelectedTasks);
}

if (taskForm) {
    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearFormMessage(taskForm);
        const task = buildTaskFromForm();
        const error = validateTask(task);
        if (error) {
            showFormError(taskForm, error);
            return;
        }
        showNetworkState('Guardando tarea...');
        try {
            const created = await createTask({
                title: task.title,
                description: task.description,
                completed: false,
                category: task.category,
                priority: task.priority,
                dueDate: task.dueDate
            });
            hideNetworkState();
            const normalized = {
                ...created,
                category: created.category || task.category || 'Otro',
                priority: created.priority || task.priority || 'Medio',
                dueDate: created.dueDate || task.dueDate || '01-01-2099',
                status: created.completed ? 'Completada' : 'Pendiente'
            };
            tasks.push(normalized);
            saveTasks(tasks);
            renderTaskCard(normalized);
            taskForm.reset();
        } catch (error) {
            showNetworkState(`Error al crear tarea: ${error.message}`, true);
        }
    });
}
