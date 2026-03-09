module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

const toggle = document.getElementById('darkModeToggle');
const body = document.body;

// Inicializar según preferencia guardada
if(localStorage.getItem('theme') === 'dark'){
    body.classList.add('dark');
    toggle.checked = true;
}

// Alternar dark mode al cambiar toggle
toggle.addEventListener('change', () => {
    body.classList.toggle('dark');
    localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
});
