// ================= Componentes =================

class SearchComponent {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.searchDropdown = document.getElementById('searchDropdown');

        this.searchInput.addEventListener('input', debounce(e => this.handleSearch(e.target.value), 500));

        document.addEventListener('click', e => {
            if (!this.searchInput.contains(e.target) && !this.searchDropdown.contains(e.target)) {
                this.hideDropdown();
            }
        });
    }

    async handleSearch(query) {
        if (!query || query.length < 2) return this.hideDropdown();

        try {
            const results = await cryptoService.searchCryptos(query);
            this.displayResults(results);
        } catch {
            this.hideDropdown();
        }
    }

    displayResults(results) {
        if (!results || !results.length) return this.hideDropdown();

        this.searchDropdown.innerHTML = results.map(c => `
            <div class="search-result" data-id="${c.id}">
                <img src="${c.large || c.thumb}" alt="${c.name}">
                <div class="search-result-info">
                    <h4>${c.name}</h4>
                    <p>${c.symbol.toUpperCase()}</p>
                </div>
                <div class="search-result-price">
                    <div class="price">$${c.current_price || 'N/A'}</div>
                    <div class="change ${c.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">
                        ${c.price_change_percentage_24h != null ? (c.price_change_percentage_24h >= 0 ? '+' : '') + c.price_change_percentage_24h.toFixed(2) + '%' : 'N/A'}
                    </div>
                </div>
            </div>
        `).join('');

        this.searchDropdown.querySelectorAll('.search-result').forEach(result =>
            result.addEventListener('click', () => {
                const cryptoId = result.getAttribute('data-id');
                showDetailView(cryptoId);
                this.searchInput.value = '';
                this.hideDropdown();
            })
        );

        this.showDropdown();
    }

    showDropdown() { this.searchDropdown.classList.add('active'); }
    hideDropdown() { this.searchDropdown.classList.remove('active'); }
}

class PaginationComponent {
    constructor() {
        this.prevBtn = document.getElementById('prevPage');
        this.nextBtn = document.getElementById('nextPage');
        this.pageInfo = document.getElementById('pageInfo');
        this.currentPage = 1;
        this.totalPages = 1;
    }

    setupEventListeners(onPageChange) {
        this.prevBtn.addEventListener('click', () => { if (this.currentPage > 1) { this.currentPage--; onPageChange(this.currentPage); } });
        this.nextBtn.addEventListener('click', () => { if (this.currentPage < this.totalPages) { this.currentPage++; onPageChange(this.currentPage); } });
    }

    update(totalItems, itemsPerPage, currentPage) {
        this.currentPage = currentPage;
        this.totalPages = Math.ceil(totalItems / itemsPerPage);

        this.pageInfo.textContent = `Página ${this.currentPage} de ${this.totalPages}`;
        this.prevBtn.disabled = currentPage <= 1;
        this.nextBtn.disabled = currentPage >= this.totalPages;

        document.getElementById('pagination').style.display = this.totalPages > 1 ? 'flex' : 'none';
    }

    reset() { this.update(0, 10, 1); }
}

class ThemeComponent {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.setTheme(this.currentTheme);
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    toggleTheme() { this.setTheme(this.currentTheme === 'dark' ? 'light' : 'dark'); }

    setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        this.themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
    }
}

// ================= Inicializar =================

const searchComponent = new SearchComponent();
const paginationComponent = new PaginationComponent();
const themeComponent = new ThemeComponent();
