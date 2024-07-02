const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : `https://${window.location.hostname}/api`;

document.addEventListener("DOMContentLoaded", function () {
    initDataFetching();
    initFilters();
    initSorting();
    initSearch();
});

let originalData = [];

function initDataFetching() {
    fetch(`${API_URL}/all-items`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            originalData = data || [];
            displayItems(originalData);
            populateFilters(originalData);
        })
        .catch(error => console.error('Error fetching data:', error));
};

function displayItems(data) {
    const container = document.getElementById('itemsRow');
    if (!container) {
        console.error('Items container element not found');
        return;
    }
    container.innerHTML = '';

    data.forEach(item => {
        const card = createCard(item);
        container.innerHTML += card;
    });

    const cardLinks = document.querySelectorAll('.card-link');
    cardLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const itemName = this.getAttribute('data-item-name');
            localStorage.removeItem('selectedItemName');
            localStorage.setItem('selectedItemName', itemName);
            window.location.href = this.href;
        });
    });
};

function createCard(item) {
    const formattedDate = formatDate(item.lostDate);
    const formattedTime = formatTime(item.timeLost);

    return `
        <div class="col">
            <a href="item.html" class="card-link" data-item-name="${item.itemName}">
                <div class="card list-item-card">
                    <img src="${item.imageUrl}" class="card-img-top" alt="${item.itemName}">
                    <div class="card-body">
                        <h5 class="card-title">${item.itemName}</h5>
                        <div class="card-details">
                            <div class="card-detail"><i class="bi bi-calendar"></i> <span>${formattedDate}</span></div>
                            <div class="card-detail"><i class="bi bi-tag"></i> <span>${item.category}</span></div>
                            <div class="card-detail"><i class="bi bi-clock"></i> <span>${formattedTime}</span></div>
                            <div class="card-detail"><i class="bi bi-geo-alt"></i> <span>${item.locationLost}</span></div>
                        </div>
                        <a href="#" class="status-btn status-${item.status.toLowerCase()}">${item.status}</a>
                    </div>
                </div>
            </a>
        </div>`;
};

function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

function formatTime(timeString) {
    const [hour, minute] = timeString.split(':');
    return `${hour}:${minute}`;
};

function populateFilters(data) {
    const locations = [...new Set(data.map(item => item.locationLost))];
    const categories = [...new Set(data.map(item => item.category))];
    const statuses = [...new Set(data.map(item => item.status))];

    populateSelect('location', locations);
    populateSelect('category', categories);
    populateSelect('status', statuses);
};

function populateSelect(selectId, options) {
    const select = document.getElementById(selectId);
    if (!select) {
        console.error(`Select element with id ${selectId} not found`);
        return;
    }
    options.forEach(option => select.add(new Option(option, option)));
};

function initFilters() {
    const applyFilterButton = document.getElementById('applyFilter');
    if (applyFilterButton) {
        applyFilterButton.addEventListener('click', applyFilters);
    }

    const clearFilterButton = document.getElementById('clearFilter');
    if (clearFilterButton) {
        clearFilterButton.addEventListener('click', clearFilters);
    }
};

function applyFilters() {
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;
    const location = document.getElementById('location').value;
    const category = document.getElementById('category').value;
    const status = document.getElementById('status').value;

    const filteredData = originalData.filter(item =>
        (!fromDate || new Date(item.lostDate) >= new Date(fromDate)) &&
        (!toDate || new Date(item.lostDate) <= new Date(toDate)) &&
        (!location || item.locationLost === location) &&
        (!category || item.category === category) &&
        (!status || item.status === status)
    );
    displayItems(filteredData);
};

function clearFilters() {
    document.getElementById('filterForm').reset();
    displayItems(originalData);
};

function initSorting() {
    const sortByFoundButton = document.getElementById('sortByFound');
    if (sortByFoundButton) {
        sortByFoundButton.addEventListener('click', () => sortItems('Found'));
    }

    const sortByLostButton = document.getElementById('sortByLost');
    if (sortByLostButton) {
        sortByLostButton.addEventListener('click', () => sortItems('Lost'));
    }
};

function sortItems(status) {
    const sortedData = originalData.filter(item => item.status === status);
    displayItems(sortedData);
};

function initSearch() {
    const performSearchButton = document.getElementById('performSearch');
    if (performSearchButton) {
        performSearchButton.addEventListener('click', performSearch);
    }
};

function performSearch() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const searchResults = originalData.filter(item => item.itemName.toLowerCase().includes(searchQuery));
    displayItems(searchResults);
    closeSearchModal();
};

function closeSearchModal() {
    const searchModal = bootstrap.Modal.getInstance(document.getElementById('searchModal'));
    if (searchModal) {
        searchModal.hide();
    }
};
