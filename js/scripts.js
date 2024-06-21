window.onload = () => {
    populateItemsTable();
    adjustHeights();
};

window.onresize = () => {
    adjustHeights();
};

function adjustHeights() {
    const chartBackground = document.querySelector('.chart-background');
    const dataBackground = document.querySelector('.data-background');
    const tableResponsive = document.querySelector('.table-responsive');

    // Reset heights
    chartBackground.style.height = 'auto';
    dataBackground.style.height = 'auto';

    // Ensure the data background fits the table height
    tableResponsive.style.height = 'auto';

    const chartHeight = chartBackground.offsetHeight;
    const dataHeight = dataBackground.offsetHeight;

    const maxHeight = Math.max(chartHeight, dataHeight);

    chartBackground.style.height = `${maxHeight}px`;
    dataBackground.style.height = `${maxHeight}px`;
}


const populateItemsTable = () => {
    fetch('data/NearbyItems.json')
        .then(response => response.json())
        .then(data => {
            const itemsTable = document.getElementById('itemsTable');
            itemsTable.innerHTML = '';

            data.forEach(item => {
                const row = document.createElement('tr');

                const itemNameCell = document.createElement('td');
                itemNameCell.textContent = item.itemName;
                row.appendChild(itemNameCell);

                const dateReportedCell = document.createElement('td');
                dateReportedCell.textContent = new Date(item.lostDate).toLocaleDateString();
                row.appendChild(dateReportedCell);

                const locationCell = document.createElement('td');
                locationCell.textContent = item.location;
                row.appendChild(locationCell);

                const statusCell = document.createElement('td');
                const statusSpan = document.createElement('span');
                statusSpan.textContent = item.status;
                if (item.status === 'Found') {
                    statusSpan.classList.add('status-found');
                } else {
                    statusSpan.classList.add('status-lost');
                }
                statusCell.appendChild(statusSpan);
                row.appendChild(statusCell);

                itemsTable.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching items:', error);
        });
}




document.addEventListener("DOMContentLoaded", function () {
    // Define the breadcrumb structure
    const breadcrumbStructure = {
        "index.html": {
            "Home": "index.html"
        },
        "report_lost.html": {
            "Home": "index.html",
            "Report Lost": "report_lost.html"
        },
        "profile.html": {
            "Home": "index.html",
            "Report Lost": "report_lost.html",
            "My Profile": "profile.html"
        },
        "list_Item.html": {
            "Home": "index.html",
            "Items List": "",
        }
        // Add more page structures as needed
    };

    // Get the current page
    const currentPage = window.location.pathname.split("/").pop();

    // Get the breadcrumb container
    const breadcrumbContainer = document.getElementById("breadcrumb");

    // Build the breadcrumb trail
    if (breadcrumbStructure[currentPage]) {
        const trail = breadcrumbStructure[currentPage];
        Object.keys(trail).forEach((key, index, array) => {
            const li = document.createElement("li");
            li.classList.add("breadcrumb-item");

            if (index === array.length - 1) {
                li.classList.add("active");
                li.setAttribute("aria-current", "page");
                li.textContent = key;
            } else {
                const a = document.createElement("a");
                a.href = trail[key];
                a.textContent = key;
                li.appendChild(a);
            }

            breadcrumbContainer.appendChild(li);
        });
    }
});


//chart 
document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('itemsChart').getContext('2d');
    const itemsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Phones', 'Wallets', 'Keys', 'Purses', 'Computers', 'Others'],
            datasets: [{
                label: 'Found Items Count',
                data: [40, 88, 60, 45, 10, 6],
                backgroundColor: 'rgba(10, 162, 192, 0.2)',
                borderColor: 'rgba(10, 162, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});


document.addEventListener('DOMContentLoaded', function() {
    fetch('data/itemsList.json')
        .then(response => response.json())
        .then(data => {
            const container = document.querySelector('.row');
            container.innerHTML = '';
            data.forEach(item => {
                const card = `
                    <div class="col">
                        <div class="card list-item-card">
                            <img src="${item.imageUrl}" class="card-img-top" alt="${item.itemName}">
                            <div class="card-body">
                                <h5 class="card-title">${item.itemName}</h5>
                                <div class="card-details">
                                    <div class="card-detail">
                                        <i class="bi bi-calendar"></i> <span>${item.lostDate}</span>
                                    </div>
                                    <div class="card-detail">
                                        <i class="bi bi-tag"></i> <span>${item.category}</span>
                                    </div>
                                    <div class="card-detail">
                                        <i class="bi bi-clock"></i> <span>${item.timeLost}</span>
                                    </div>
                                    <div class="card-detail">
                                        <i class="bi bi-geo-alt"></i> <span>${item.locationLost}</span>
                                    </div>
                                </div>
                                <a href="#" class="status-btn status-${item.status.toLowerCase()}">${item.status}</a>
                            </div>
                        </div>
                    </div>`;
                container.innerHTML += card;
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});



