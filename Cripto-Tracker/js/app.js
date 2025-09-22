// ================= Inicialización de la aplicación =================

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initComponents();
    loadInitialData();
});

// ================= Configuración de eventos =================

function setupEventListeners() {
    const onClickDashboard = () => showDashboardView();

    document.getElementById('logoBtn').addEventListener('click', onClickDashboard);
    document.getElementById('backBtn').addEventListener('click', onClickDashboard);

    document.querySelectorAll('.filter-btn').forEach(btn =>
        btn.addEventListener('click', () => changeFilter(btn.dataset.filter))
    );

    document.querySelectorAll('.sort-btn').forEach(btn =>
        btn.addEventListener('click', () => sortCryptos(btn.dataset.sort))
    );

    document.getElementById('currencySelect').addEventListener('change', e => {
        appState.currency = e.target.value;
        loadCryptos();
    });

    paginationComponent.setupEventListeners(page => {
        appState.currentPage = page;
        renderCryptos();
    });
}

// ================= Inicialización de componentes =================

function initComponents() {
    console.log('Componentes inicializados');
}

// ================= Carga inicial de datos =================

function loadInitialData() {
    showDashboardView();
    setInterval(loadCryptos, 60000); // refrescar datos cada 60s
}
