const API_BASE_URL = 'http://localhost:3000/api/v1/tasks';

async function request(url, options = {}) {
    let response;
    try {
        response = await fetch(url, options);
    } catch (e) {
        const err = new Error(
            'No se pudo conectar con el servidor. Arranca el backend (puerto 3000) y recarga la página.'
        );
        err.cause = e;
        throw err;
    }
    const contentType = response.headers.get('content-type') || '';
    const hasJsonBody = contentType.includes('application/json');
    const payload = hasJsonBody ? await response.json() : null;

    if (!response.ok) {
        const message = payload?.error || `Error HTTP ${response.status}`;
        const err = new Error(message);
        err.status = response.status;
        throw err;
    }

    return payload;
}

export async function fetchTasks() {
    return request(API_BASE_URL, { method: 'GET' });
}

export async function createTask(taskInput) {
    return request(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskInput)
    });
}

export async function updateTask(id, taskPatch) {
    return request(`${API_BASE_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskPatch)
    });
}

export async function deleteTask(id) {
    return request(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
}
