// ── Dark mode ──
const html       = document.documentElement;
const darkToggle = document.getElementById('darkToggle');

if (localStorage.getItem('theme') === 'dark') {
    html.classList.add('dark');
    darkToggle.checked = true;
}
darkToggle.addEventListener('change', () => {
    html.classList.toggle('dark', darkToggle.checked);
    localStorage.setItem('theme', darkToggle.checked ? 'dark' : 'light');
});

// ── Data ──
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
const list = document.getElementById('task-list');
const form = document.getElementById('task-form');

tasks.forEach(renderCard);

// ── Submit ──
form.addEventListener('submit', function(e) {
    e.preventDefault();
    const task = {
        id:          Date.now(),
        title:       document.getElementById('task-title').value.trim(),
        description: document.getElementById('task-desc').value.trim(),
        category:    document.getElementById('category-select').value,
        priority:    document.getElementById('priority-select').value,
        dueDate:     document.getElementById('task-date').value,
        completed:   false
    };
    tasks.push(task);
    save();
    renderCard(task);
    form.reset();
});

// ── Render card ──
function renderCard(task) {
    const article = document.createElement('article');
    article.className        = 'card-task';
    article.dataset.id       = task.id;
    article.dataset.category = task.category;
    article.dataset.level    = task.priority;

    const priClass = { Alto: 'badge-alto', Medio: 'badge-medio', Bajo: 'badge-bajo' }[task.priority] || '';

    article.innerHTML = `
        <div class="card2">
            <h3 class="task-title">
                <input type="checkbox" id="cb-${task.id}" ${task.completed ? 'checked' : ''}>
                <label for="cb-${task.id}">${task.title}</label>
            </h3>
            ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
            <div class="card-meta">
                <span class="badge badge-cat">${task.category}</span>
                <span class="badge ${priClass}">${task.priority}</span>
                <span class="task-date">📅 ${task.dueDate}</span>
            </div>
            <button class="delete-btn"> × </button>
        </div>
    `;

    // Checkbox — strikethrough + save
    article.querySelector(`#cb-${task.id}`).addEventListener('change', function() {
        const t = tasks.find(t => t.id === task.id);
        if (t) { t.completed = this.checked; save(); }
        applyFilters();
    });

    // Delete — fade out then remove
    article.querySelector('.delete-btn').addEventListener('click', () => {
        article.style.transition = 'opacity 0.2s, transform 0.2s';
        article.style.opacity    = '0';
        article.style.transform  = 'translateY(-8px)';
        setTimeout(() => {
            article.remove();
            tasks = tasks.filter(t => t.id !== task.id);
            save();
        }, 200);
    });

    list.appendChild(article);
}

// ── Save to localStorage ──
function save() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ── Filters ──
function applyFilters() {
    const cats  = vals('.f-cat');
    const pris  = vals('.f-pri');
    const stats = vals('.f-sta');

    document.querySelectorAll('.card-task').forEach(card => {
        const okCat  = !cats.length  || cats.includes(card.dataset.category);
        const okPri  = !pris.length  || pris.includes(card.dataset.level);
        const done   = card.querySelector('input[type="checkbox"]')?.checked;
        const okStat = !stats.length || stats.includes(done ? 'Completada' : 'Pendiente');
        card.style.display = (okCat && okPri && okStat) ? '' : 'none';
    });
}

function vals(sel) {
    return [...document.querySelectorAll(sel)].filter(c => c.checked).map(c => c.value);
}

document.querySelectorAll('.f-cat, .f-pri, .f-sta')
    .forEach(cb => cb.addEventListener('change', applyFilters));

document.getElementById('resetBtn').addEventListener('click', () => {
    document.querySelectorAll('.f-cat, .f-pri, .f-sta').forEach(cb => cb.checked = false);
    applyFilters();
});