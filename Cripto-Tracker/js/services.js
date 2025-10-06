class CryptoService {
    constructor() {
        this.baseURL = 'https://api.coingecko.com/api/v3';
        this.cache = new Map();
        this.defaultCacheTime = 30000; // 30 segundos por defecto
    }

    // ======== Fetch genérico con cache ========
    async fetchWithCache(url, cacheKey, cacheDuration = this.defaultCacheTime) {
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < cacheDuration) {
            return cached.data;
        }

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`${res.status} - ${res.statusText}`);
            const data = await res.json();
            this.cache.set(cacheKey, { data, timestamp: Date.now() });
            return data;
        } catch (err) {
            console.error(`Error fetching ${cacheKey}:`, err);
            throw { message: err.message, type: 'fetch' };
        }
    }

    // ======== Top Cryptos ========
    async getTopCryptos(limit = 20, currency = 'usd') {
        const url = `${this.baseURL}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`;
        return this.fetchWithCache(url, `top-${limit}-${currency}`);
    }

    // ======== Detalles de una Cripto ========
    async getCryptoDetails(id, currency = 'usd') {
        const url = `${this.baseURL}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
        return this.fetchWithCache(url, `detail-${id}-${currency}`);
    }

    // ======== Buscar Criptos ========
    async searchCryptos(query, currency = 'usd') {
        if (!query || query.length < 2) return [];

        const cacheKey = `search-${query}-${currency}`;
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < 300000) return cached.data; // 5 min

        // 1. Buscar IDs
        const searchData = await this.fetchWithCache(
            `${this.baseURL}/search?query=${encodeURIComponent(query)}`,
            `${cacheKey}-ids`
        );

        const topResults = searchData.coins.slice(0, 5);
        if (!topResults.length) return [];

        // 2. Obtener datos de mercado
        const ids = topResults.map(c => c.id).join(',');
        const marketData = await this.fetchWithCache(
            `${this.baseURL}/coins/markets?vs_currency=${currency}&ids=${ids}&order=market_cap_desc&per_page=8&page=1&sparkline=false&price_change_percentage=24h`,
            `${cacheKey}-market`
        );

        // 3. Combinar resultados
        const enriched = topResults.map(c => {
            const m = marketData.find(m => m.id === c.id) || {};
            return { ...c, ...m };
        });

        this.cache.set(cacheKey, { data: enriched, timestamp: Date.now() });
        return enriched;
    }

    // ======== Datos Globales ========
    async getGlobalData() {
        return this.fetchWithCache(`${this.baseURL}/global`, 'global');
    }

}

// ======== Instancia única ========
const cryptoService = new CryptoService();
