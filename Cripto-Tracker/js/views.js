// ==================== Vistas ====================
function renderDetailView(crypto) {
    const { market_data: market } = crypto;
    document.getElementById('detailLogo').src = crypto.image.large;
    document.getElementById('detailLogo').alt = crypto.name;
    document.getElementById('detailName').textContent = crypto.name;
    document.getElementById('detailSymbol').textContent = crypto.symbol.toUpperCase();
    document.getElementById('detailPrice').textContent = `$${market.current_price.usd.toLocaleString()}`;

    const change24h = market.price_change_percentage_24h;
    document.getElementById('detailChange').textContent = `${getChangeSymbol(change24h)} ${Math.abs(change24h).toFixed(2)}% (24h)`;
    document.getElementById('detailChange').className = `detail-change ${getChangeClass(change24h)}`;

    renderDetailStats(crypto);
    renderAdditionalInfo(crypto);
}

function renderDetailStats(crypto) {
    const m = crypto.market_data;
    const statsGrid = document.getElementById('statsGrid');

    statsGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-card-label">Market Cap</div>
            <div class="stat-card-value">${formatNumber(m.market_cap.usd)}</div>
            <div class="stat-card-change ${m.market_cap_change_percentage_24h >= 0 ? 'positive' : 'negative'}">
                ${m.market_cap_change_percentage_24h >= 0 ? '+' : ''}${m.market_cap_change_percentage_24h.toFixed(2)}%
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-card-label">Volumen 24h</div>
            <div class="stat-card-value">${formatNumber(m.total_volume.usd)}</div>
        </div>
        <div class="stat-card">
            <div class="stat-card-label">Suministro Circulante</div>
            <div class="stat-card-value">${m.circulating_supply.toLocaleString()} ${crypto.symbol.toUpperCase()}</div>
            <div class="stat-card-change">
                ${m.circulating_supply && m.max_supply ? ((m.circulating_supply / m.max_supply) * 100).toFixed(1) + '% del máx' : 'N/A'}
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-card-label">ATH (Máximo)</div>
            <div class="stat-card-value">$${m.ath.usd.toLocaleString()}</div>
            <div class="stat-card-change ${m.ath_change_percentage.usd >= 0 ? 'positive' : 'negative'}">
                ${m.ath_change_percentage.usd >= 0 ? '+' : ''}${m.ath_change_percentage.usd.toFixed(1)}%
            </div>
        </div>
    `;
}

function renderAdditionalInfo(crypto) {
    const m = crypto.market_data;
    const infoList = document.getElementById('infoList');

    infoList.innerHTML = `
        <div class="info-item"><span class="info-item-label">Precio más bajo (24h)</span><span class="info-item-value">$${m.low_24h.usd.toLocaleString()}</span></div>
        <div class="info-item"><span class="info-item-label">Precio más alto (24h)</span><span class="info-item-value">$${m.high_24h.usd.toLocaleString()}</span></div>
        <div class="info-item"><span class="info-item-label">Ranking Market Cap</span><span class="info-item-value">#${crypto.market_cap_rank || 'N/A'}</span></div>
    `;
}

async function updateLiveStats(data) {
    const liveStats = document.getElementById('liveStats');
    try {
        const globalData = await cryptoService.getGlobalData();
        const marketCap = globalData.data.total_market_cap.usd;
        const marketCapChange = globalData.data.market_cap_change_percentage_24h_usd;

        const btc = data.find(c => c.symbol === 'btc') || data[0];
        const eth = data.find(c => c.symbol === 'eth') || data[1];

        liveStats.innerHTML = [btc, eth].map(c => `
            <div class="stat-item">
                <div class="stat-label">${c.name}</div>
                <div class="stat-value">$${c.current_price.toLocaleString()}</div>
                <div class="stat-change ${getChangeClass(c.price_change_percentage_24h)}">
                    ${getChangeSymbol(c.price_change_percentage_24h)} ${Math.abs(c.price_change_percentage_24h).toFixed(2)}%
                </div>
            </div>
        `).join('') + `
            <div class="stat-item">
                <div class="stat-label">Market Cap</div>
                <div class="stat-value">${formatNumber(marketCap)}</div>
                <div class="stat-change ${marketCapChange >= 0 ? 'positive' : 'negative'}">
                    ${marketCapChange >= 0 ? '+' : ''}${marketCapChange.toFixed(2)}%
                </div>
            </div>
        `;
    } catch (err) {
        console.error('Error updating live stats:', err);
        liveStats.innerHTML = `<div class="stat-item"><div class="stat-label">Error</div><div class="stat-value">N/A</div><div class="stat-change">${err.message}</div></div>`;
    }
}

// ==================== Vistas principales ====================
function showDashboardView() {
    toggleView('dashboardView', 'detailView');
    appState.currentView = 'dashboard';
    document.getElementById('searchInput').value = '';
    document.getElementById('searchDropdown').classList.remove('active');
    loadCryptos();
}

async function showDetailView(cryptoId) {
    toggleView('detailView', 'dashboardView');
    appState.currentView = 'detail';
    try {
        const crypto = await cryptoService.getCryptoDetails(cryptoId, appState.currency);
        renderDetailView(crypto);
    } catch (err) {
        console.error('Error loading crypto details:', err);
        showDetailErrorState(err.message);
    }
}

// ==================== Filtros y Orden ====================
function changeFilter(filter) {
    appState.currentFilter = filter;
    appState.currentPage = 1;
    updateActiveButtons('.filter-btn', filter, 'filter');

    document.getElementById('sortFilters').classList.toggle('active', filter === 'all');
    document.getElementById('pagination').style.display = filter === 'all' ? 'flex' : 'none';

    renderCryptos();
}

function sortCryptos(sortType) {
    appState.currentSort = sortType;
    updateActiveButtons('.sort-btn', sortType, 'sort');
    renderCryptos();
}

// ==================== Carga de datos ====================
async function loadCryptos() {
    const target = appState.currentFilter === 'all' ? document.getElementById('cryptoList') : document.getElementById('cryptoGrid');
    renderMessage(target, '⏳', 'Cargando datos...');
    try {
        const data = await cryptoService.getTopCryptos(50, appState.currency);
        appState.cryptoData = data;
        updateLiveStats(data);
        renderCryptos();
    } catch (err) {
        console.error('Error loading cryptos:', err);
        showErrorState(err.message);
    }
}

// ==================== Renderizado ====================
function renderCryptos() {
    const list = document.getElementById('cryptoList');
    const grid = document.getElementById('cryptoGrid');
    const pagination = document.getElementById('pagination');

    list.innerHTML = grid.innerHTML = '';

    if (!appState.cryptoData.length) {
        renderMessage(appState.currentFilter === 'all' ? list : grid, '📊', 'No hay datos disponibles');
        return;
    }

    let filtered = [...appState.cryptoData];
    if (appState.currentFilter === 'gainers') filtered = filtered.filter(c => c.price_change_percentage_24h > 0).sort((a,b)=>b.price_change_percentage_24h-a.price_change_percentage_24h).slice(0,10);
    if (appState.currentFilter === 'losers') filtered = filtered.filter(c => c.price_change_percentage_24h < 0).sort((a,b)=>a.price_change_percentage_24h-b.price_change_percentage_24h).slice(0,10);
    if (appState.currentFilter === 'favorites') {
        filtered = filtered.filter(c => appState.favorites.includes(c.id));
        pagination.style.display = 'none';
        if (!filtered.length) {
            renderMessage(grid, '⭐', 'No tienes criptomonedas favoritas<br><small>Haz clic en el corazón para agregar</small>');
            list.classList.remove('active'); grid.classList.add('active');
            return;
        }
    }

    if (appState.currentSort === 'name') filtered.sort((a,b)=>a.name.localeCompare(b.name));
    if (appState.currentSort === 'price') filtered.sort((a,b)=>b.current_price-a.current_price);

    let paginated = filtered;
    if (appState.currentFilter === 'all') {
        const start = (appState.currentPage-1)*appState.itemsPerPage;
        paginated = filtered.slice(start, start+appState.itemsPerPage);
        paginationComponent.update(filtered.length, appState.itemsPerPage, appState.currentPage);
        pagination.style.display = 'flex';
    }

    if (appState.currentFilter === 'all') {
        list.classList.add('active'); grid.classList.remove('active');
        renderList(list, paginated);
    } else {
        list.classList.remove('active'); grid.classList.add('active');
        renderGrid(grid, filtered);
    }
}

function renderList(container, cryptos) {
    container.innerHTML = `
        <div class="list-header">
            <div>Moneda</div><div>Precio</div><div>24h %</div><div>Market Cap</div><div>Volumen 24h</div><div></div>
        </div>
    `;
    container.innerHTML += cryptos.map(c => {
        const fav = appState.favorites.includes(c.id);
        return `
            <div class="crypto-list-item" onclick="showDetailView('${c.id}')">
                <div class="list-coin-main">
                    <img src="${c.image}" class="list-coin-logo">
                    <div class="list-coin-info">
                        <h3>${c.name}</h3><span>${c.symbol.toUpperCase()}</span>
                    </div>
                </div>
                <div>$${c.current_price.toLocaleString()}</div>
                <div class="${getChangeClass(c.price_change_percentage_24h)}">${getChangeSymbol(c.price_change_percentage_24h)} ${Math.abs(c.price_change_percentage_24h).toFixed(2)}%</div>
                <div>${formatNumber(c.market_cap)}</div>
                <div>${formatNumber(c.total_volume)}</div>
                <button class="list-favorite-btn ${fav ? 'active' : ''}" onclick="event.stopPropagation();toggleFavorite('${c.id}')">${fav ? '♥' : '♡'}</button>
            </div>
        `;
    }).join('');
}

function renderGrid(container, cryptos) {
    container.innerHTML = cryptos.map(c => {
        const fav = appState.favorites.includes(c.id);
        return `
            <div class="crypto-card" onclick="showDetailView('${c.id}')">
                <div class="coin-header">
                    <div class="coin-main">
                        <img src="${c.image}" class="coin-logo">
                        <div><h3>${c.name}</h3><span>${c.symbol.toUpperCase()}</span></div>
                    </div>
                    <button class="favorite-btn ${fav ? 'active' : ''}" onclick="event.stopPropagation();toggleFavorite('${c.id}')">${fav ? '♥' : '♡'}</button>
                </div>
                <div class="coin-price">
                    <span>$${c.current_price.toLocaleString()}</span>
                    <span class="${getChangeClass(c.price_change_percentage_24h)}">${getChangeSymbol(c.price_change_percentage_24h)} ${Math.abs(c.price_change_percentage_24h).toFixed(2)}%</span>
                </div>
                <div class="coin-stats">
                    <div><span>Market Cap</span><span>${formatNumber(c.market_cap)}</span></div>
                    <div><span>Volumen 24h</span><span>${formatNumber(c.total_volume)}</span></div>
                </div>
            </div>
        `;
    }).join('');
}


// ==================== Globales ====================
Object.assign(window, { showDashboardView, showDetailView, changeFilter, sortCryptos, loadCryptos });
