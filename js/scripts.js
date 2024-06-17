window.onload = () => {
    populateItemsTable();
    adjustHeights();
};
// window.onresize = () => {
//     adjustHeights();
// };

function adjustHeights() {
    const chartBackground = document.querySelector('.chart-background');
    const dataBackground = document.querySelector('.data-background');

    // Reset heights
    chartBackground.style.height = 'auto';
    dataBackground.style.height = 'auto';

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
            maintainAspectRatio: true,
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


