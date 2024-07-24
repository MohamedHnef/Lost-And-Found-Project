const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'https://lost-and-found-project.onrender.com/api';

window.onload = () => {
    populateItemsTable();
    initializeChart();
};

const populateItemsTable = () => {
    fetch(`${API_URL}/items`)
        .then(response => response.json())
        .then(data => {
            const itemsTable = document.getElementById('itemsTable');
            itemsTable.innerHTML = '';

            data.forEach(item => {
                const row = document.createElement('tr');

                row.appendChild(createTableCell(item.itemName));
                row.appendChild(createTableCell(new Date(item.lostDate).toLocaleDateString()));
                row.appendChild(createTableCell(item.locationLost));
                row.appendChild(createStatusCell(item.status));

                itemsTable.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching items:', error));
};

const createTableCell = (text) => {
    const cell = document.createElement('td');
    cell.textContent = text;
    return cell;
};

const createStatusCell = (status) => {
    const cell = document.createElement('td');
    const span = document.createElement('span');
    span.textContent = status;
    span.classList.add(status === 'Found' ? 'status-found' : 'status-lost');
    cell.appendChild(span);
    return cell;
};

const initializeChart = () => {
    fetch(`${API_URL}/home-graph-data`)
        .then(response => response.json())
        .then(data => {
            const ctx = document.getElementById('itemsChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Found Items Count',
                        data: data.values,
                        backgroundColor: 'rgba(10, 162, 192, 0.2)',
                        borderColor: 'rgba(10, 162, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    responsive: true,
                    scales: {
                        x: { beginAtZero: true },
                        y: { beginAtZero: true }
                    }
                }
            });
        })
        .catch(error => console.error('Error fetching chart data:', error));
};
