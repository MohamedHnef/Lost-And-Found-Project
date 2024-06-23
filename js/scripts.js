document.addEventListener("DOMContentLoaded", function () {
    initBreadcrumbs();
    initDataFetching();
    initFilters();
    initSorting();
    initSearch();
});

let originalData = [];


//breadcrumbs
function initBreadcrumbs() {
    const breadcrumbContainer = document.getElementById("breadcrumb");
    const currentPage = document.title.split(' - ')[1];
    let breadcrumbTrail = JSON.parse(sessionStorage.getItem('breadcrumbTrail')) || ["Home"];

    if (!breadcrumbTrail.includes(currentPage)) {
        breadcrumbTrail.push(currentPage);
    } else {
        breadcrumbTrail = breadcrumbTrail.slice(0, breadcrumbTrail.indexOf(currentPage) + 1);
    }
    sessionStorage.setItem('breadcrumbTrail', JSON.stringify(breadcrumbTrail));

    breadcrumbContainer.innerHTML = '';
    breadcrumbTrail.forEach((crumb, index) => {
        const li = document.createElement("li");
        li.classList.add("breadcrumb-item");
        if (index === breadcrumbTrail.length - 1) {
            li.classList.add("active");
            li.setAttribute("aria-current", "page");
            li.textContent = crumb;
        } else {
            const a = document.createElement("a");
            a.href = crumb === "Home" ? "index.html" : crumb.toLowerCase().replace(/\s/g, '_') + ".html";
            a.textContent = crumb;
            li.appendChild(a);
        }
        breadcrumbContainer.appendChild(li);
    });
}


// items list cards
function initDataFetching() {
    fetch('data/items.json')
        .then(response => response.json())
        .then(data => {
            originalData = data;
            const reportedItems = JSON.parse(sessionStorage.getItem('addedItems')) || [];
            displayItems([...originalData, ...reportedItems]);
            populateFilters(originalData);
        })
        .catch(error => console.error('Error fetching data:', error));
}

function displayItems(data) {
    const container = document.getElementById('itemsRow');
    container.innerHTML = '';

    data.forEach(item => {
        const card = createCard(item);
        container.innerHTML += card;
    });
}

function createCard(item) {
    return `
        <div class="col">
            <div class="card list-item-card">
                <img src="${item.imageUrl}" class="card-img-top" alt="${item.itemName}">
                <div class="card-body">
                    <h5 class="card-title">${item.itemName}</h5>
                    <div class="card-details">
                        <div class="card-detail"><i class="bi bi-calendar"></i> <span>${item.lostDate}</span></div>
                        <div class="card-detail"><i class="bi bi-tag"></i> <span>${item.category}</span></div>
                        <div class="card-detail"><i class="bi bi-clock"></i> <span>${item.timeLost}</span></div>
                        <div class="card-detail"><i class="bi bi-geo-alt"></i> <span>${item.locationLost}</span></div>
                    </div>
                    <a href="#" class="status-btn status-${item.status.toLowerCase()}">${item.status}</a>
                </div>
            </div>
        </div>`;
}

function populateFilters(data) {
    const locations = [...new Set(data.map(item => item.locationLost))];
    const categories = [...new Set(data.map(item => item.category))];
    const statuses = [...new Set(data.map(item => item.status))];

    populateSelect('location', locations);
    populateSelect('category', categories);
    populateSelect('status', statuses);
}

function populateSelect(selectId, options) {
    const select = document.getElementById(selectId);
    options.forEach(option => select.add(new Option(option, option)));
}

function initFilters() {
    document.getElementById('applyFilter').addEventListener('click', applyFilters);
    document.getElementById('clearFilter').addEventListener('click', clearFilters);
}

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
}

function clearFilters() {
    document.getElementById('filterForm').reset();
    displayItems(originalData);
}

function initSorting() {
    document.getElementById('sortByFound').addEventListener('click', () => sortItems('Found'));
    document.getElementById('sortByLost').addEventListener('click', () => sortItems('Lost'));
}

function sortItems(status) {
    const sortedData = originalData.filter(item => item.status === status);
    displayItems(sortedData);
}

function initSearch() {
    document.getElementById('performSearch').addEventListener('click', performSearch);
}

function performSearch() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const searchResults = originalData.filter(item => item.itemName.toLowerCase().includes(searchQuery));
    displayItems(searchResults);
    closeSearchModal();
}

function closeSearchModal() {
    const searchModal = bootstrap.Modal.getInstance(document.getElementById('searchModal'));
    searchModal.hide();
}



// profile page table
const populateTableWithData = () => {
    fetch('data/data.json')
        .then(response => response.json())
        .then(data => {
            const itemsTable = document.getElementById('itemsTable');
            itemsTable.innerHTML = ''; // Clear any existing rows

            data.forEach(item => {
                const row = document.createElement('tr');

                const nameCell = document.createElement('td');
                nameCell.textContent = item.itemName;
                row.appendChild(nameCell);

                const dateCell = document.createElement('td');
                dateCell.textContent = item.lostDate;
                row.appendChild(dateCell);

                const locationCell = document.createElement('td');
                locationCell.textContent = item.location;
                row.appendChild(locationCell);

                const statusCell = document.createElement('td');
                statusCell.textContent = item.status;
                row.appendChild(statusCell);

                itemsTable.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
};

document.addEventListener("DOMContentLoaded", function () {
    fetch("../Lost-And-Found-Project/data/reports.json")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const reportsTbody = document.getElementById("reports-tbody");
            data.forEach(report => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${report.itemName}</td>
                    <td>${report.category}</td>
                    <td>${report.color}</td>
                    <td>${report.dateFound}</td>
                    <td>${report.location}</td>
                    <td><span class="badge bg-danger">${report.status}</span></td>
                    <td class="actions">
                        <img src="../Lost-And-Found-Project/images/view-icon.png" alt="View" class="action-icon">
                        <img src="../Lost-And-Found-Project/images/edit-icon.png" alt="Edit" class="action-icon">
                        <img src="../Lost-And-Found-Project/images/delete-icon.png" alt="Delete" class="action-icon">
                    </td>
                `;

                reportsTbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching JSON:', error);
        });
});

//chart profile page
document.addEventListener("DOMContentLoaded", function () {
    var ctx = document.getElementById('myChart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Items Reported',
                data: [0, 25, 15, 10, 30, 50],
                backgroundColor: 'rgba(10, 162, 192, 0.2)',
                borderColor: '#0AA2C0',
                borderWidth: 2,
                pointBackgroundColor: '#0AA2C0'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});



