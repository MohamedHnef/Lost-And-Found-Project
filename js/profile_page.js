
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'https://lost-and-found-project.onrender.com';

document.addEventListener("DOMContentLoaded", () => {
    const userId = 1; 
    if (!userId) {
        console.error('User ID is missing');
        return;
    }
    populateTableWithData(userId);
    initializeChart();
});

const populateTableWithData = (userId) => {
    fetch(`${API_URL}/user-items?userId=${userId}`)
        .then(response => response.json())
        .then(data => {
            const reportsTbody = document.getElementById('reports-tbody');
            if (!reportsTbody) {
                console.error('Reports tbody element not found');
                return;
            }
            reportsTbody.innerHTML = '';
            data.forEach(item => {
                const row = document.createElement('tr');
                row.appendChild(createTableCell(item.itemName));
                row.appendChild(createTableCell(item.category));
                row.appendChild(createTableCell(item.color));
                row.appendChild(createTableCell(new Date(item.lostDate).toLocaleDateString('en-CA')));
                row.appendChild(createTableCell(item.locationLost));
                row.appendChild(createStatusCell(item.status));
                row.appendChild(createActionsCell(item.id));
                reportsTbody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching data:', error));
};

const createTableCell = (text) => {
    const cell = document.createElement('td');
    cell.textContent = text;
    return cell;
};

const createStatusCell = (status) => {
    const cell = document.createElement('td');
    const button = document.createElement('button');
    button.textContent = status;
    button.className = `statusProfile-btn statusProfile-${status.toLowerCase()}`;
    button.style.fontSize = '12px';
    cell.appendChild(button);
    return cell;
};

const createActionsCell = (id) => {
    const cell = document.createElement('td');
    cell.classList.add('actions');
    ['view', 'edit', 'delete'].forEach(action => {
        const icon = document.createElement('img');
        icon.src = `images/${action}-icon.png`;
        icon.alt = action.charAt(0).toUpperCase() + action.slice(1);
        icon.classList.add('action-icon');
        icon.addEventListener('click', () => {
            if (action === 'view') viewItem(id);
            if (action === 'edit') editItem(id);
            if (action === 'delete') deleteItem(id);
        });
        cell.appendChild(icon);
    });
    return cell;
};

const viewItem = (id) => window.location.href = `item.html?id=${id}`;
const editItem = (id) => window.location.href = `edit_item.html?id=${id}`;
const deleteItem = (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
        fetch(`${API_URL}/items/${id}`, { method: 'DELETE' })
            .then(response => {
                if (!response.ok) throw new Error('Failed to delete item');
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
    fetch(`${API_URL}/profile-graph-data`)
        .then(response => response.json())
        .then(data => {
            const ctx = document.getElementById('myChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Items Reported',
                        data: data.values,
                        backgroundColor: 'rgba(10, 162, 192, 0.2)',
                        borderColor: '#0AA2C0',
                        borderWidth: 2,
                        pointBackgroundColor: '#0AA2C0'
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        })
        .catch(error => console.error('Error fetching chart data:', error));
};
