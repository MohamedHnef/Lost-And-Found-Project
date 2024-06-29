const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'https://lost-and-found-project.onrender.com/api';

window.onload = () => {
    populateItemsTable();
};

const populateItemsTable = () => {
    fetch(`${API_URL}/items`)
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
                locationCell.textContent = item.locationLost;
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

// Chart
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
