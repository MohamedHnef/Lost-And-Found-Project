document.addEventListener("DOMContentLoaded", function () {
    const userId = 1; // Replace with actual user ID
    if (!userId) {
        console.error('User ID is missing');
        return;
    }
    populateTableWithData(userId);
    initializeChart();
});

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'https://lost-and-found-project.onrender.com/api';

const populateTableWithData = (userId) => {
    fetchUserItems(userId)
        .then(data => updateTable(data))
        .catch(error => console.error('Error fetching data:', error));
};

const fetchUserItems = (userId) => {
    return fetch(`${API_URL}/user-items?userId=${userId}`)
        .then(response => response.json());
};

const updateTable = (data) => {
    const reportsTbody = document.getElementById('reports-tbody');
    if (!reportsTbody) {
        console.error('Reports tbody element not found');
        return;
    }
    reportsTbody.innerHTML = ''; // Clear any existing rows
    data.forEach(item => createTableRow(item, reportsTbody));
};

const createTableRow = (item, tbody) => {
    const row = document.createElement('tr');
    row.appendChild(createTableCell(item.itemName));
    row.appendChild(createTableCell(item.category));
    row.appendChild(createTableCell(item.color));
    row.appendChild(createTableCell(formatDate(item.lostDate)));
    row.appendChild(createTableCell(item.locationLost));
    row.appendChild(createStatusButtonCell(item));
    row.appendChild(createActionsCell(item));
    tbody.appendChild(row);
};

const createTableCell = (text) => {
    const cell = document.createElement('td');
    cell.textContent = text;
    return cell;
};

const createStatusButtonCell = (item) => {
    const cell = document.createElement('td');
    const statusButton = document.createElement('button');
    statusButton.textContent = item.status;
    statusButton.className = `statusProfile-btn statusProfile-${item.status.toLowerCase()}`;
    statusButton.style.fontSize = '12px'; // Make the button smaller
    cell.appendChild(statusButton);
    return cell;
};

const createActionsCell = (item) => {
    const cell = document.createElement('td');
    cell.classList.add('actions');
    cell.appendChild(createActionIcon('images/view-icon.png', 'View', () => viewItem(item.id)));
    cell.appendChild(createActionIcon('images/edit-icon.png', 'Edit', () => editItem(item.id)));
    cell.appendChild(createActionIcon('images/delete-icon.png', 'Delete', () => deleteItem(item.id)));
    return cell;
};

const createActionIcon = (src, alt, onClick) => {
    const icon = document.createElement('img');
    icon.src = src;
    icon.alt = alt;
    icon.classList.add('action-icon');
    icon.addEventListener('click', onClick);
    return icon;
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-CA'); // Format date as YYYY-MM-DD
};

const viewItem = (id) => {
    window.location.href = `item.html?id=${id}`;
};

const editItem = (id) => {
    window.location.href = `edit_item.html?id=${id}`;
};

const deleteItem = (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
        fetch(`${API_URL}/items/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete item');
            }
            return response.json();
        })
        .then(() => {
            alert('Item deleted successfully');
            window.location.reload();
        })
        .catch(error => {
            console.error('Error deleting item:', error);
            alert('Failed to delete item. Please try again.');
        });
    }
};

const initializeChart = () => {
    fetch('server/data/profileGraph.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(chartData => {
            const ctx = document.getElementById('myChart').getContext('2d');
            const myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        label: 'Items Reported',
                        data: chartData.data,
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
        })
        .catch(error => {
            console.error('Error fetching chart data:', error);
        });
};

document.addEventListener('DOMContentLoaded', initializeChart);
