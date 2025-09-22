window.appState = {
    currentView: 'dashboard',
    currentFilter: 'all',
    currentSort: 'default',
    favorites: JSON.parse(localStorage.getItem('cryptoFavorites')) || [],
    currentPage: 1,
    itemsPerPage: 15,
    currency: 'usd',
    cryptoData: []
};
