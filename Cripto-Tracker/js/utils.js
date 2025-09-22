// ==================== Utilidades Generales ====================

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

function formatNumber(num, digits = 2) {
    if (num == null) return 'N/A';
    if (num >= 1e9) return '$' + (num / 1e9).toFixed(digits) + 'B';
    if (num >= 1e6) return '$' + (num / 1e6).toFixed(digits) + 'M';
    if (num >= 1e3) return '$' + (num / 1e3).toFixed(digits) + 'K';
    return '$' + num.toFixed(digits);
}

// ==================== Utilidades UI ====================
const toggleView = (showId, hideId) => {
    document.getElementById(showId).style.display = 'block';
    document.getElementById(hideId).style.display = 'none';
};

const updateActiveButtons = (selector, value, attr = 'filter') =>
    document.querySelectorAll(selector).forEach(btn =>
        btn.classList.toggle('active', btn.dataset[attr] === value)
    );

const renderMessage = (container, icon, msg, color = 'var(--text-muted)', action = '') => {
    container.innerHTML = `
        <div style="text-align:center;padding:2rem;color:${color};">
            <div style="font-size:2rem;margin-bottom:1rem;">${icon}</div>
            <p>${msg}</p>
            ${action}
        </div>
    `;
};

function toggleFavorite(id) {
    const i = appState.favorites.indexOf(id);
    i === -1 ? appState.favorites.push(id) : appState.favorites.splice(i, 1);
    localStorage.setItem('cryptoFavorites', JSON.stringify(appState.favorites));
    renderCryptos();
}

const getChangeClass = val => val >= 0 ? 'positive' : 'negative';
const getChangeSymbol = val => val >= 0 ? '↗' : '↘';


// ==================== Utilidades De Estados ====================

function showLoadingState() {
    const target = appState.currentFilter === 'all' ? document.getElementById('cryptoList') : document.getElementById('cryptoGrid');
    renderMessage(target, '⏳', 'Cargando datos...');
}

function showErrorState(msg) {
    const target = appState.currentFilter === 'all' ? document.getElementById('cryptoList') : document.getElementById('cryptoGrid');
    renderMessage(target, '❌', `Error al cargar los datos<br>${msg}`, 'var(--danger)', `<button onclick="loadCryptos()">Reintentar</button>`);
}

function showDetailErrorState(msg) {
    document.querySelector('.detail-content').innerHTML = `
        <div style="text-align:center;padding:3rem;color:var(--danger);">
            <div style="font-size:3rem;">❌</div>
            <h2>Error al cargar los detalles</h2>
            <p>${msg}</p>
            <button onclick="showDashboardView()">Volver al Dashboard</button>
        </div>
    `;
}

Object.assign(window, { toggleFavorite,showDetailErrorState,showLoadingState,showErrorState,debounce, formatNumber, toggleView, updateActiveButtons, renderMessage, getChangeClass, getChangeSymbol });
