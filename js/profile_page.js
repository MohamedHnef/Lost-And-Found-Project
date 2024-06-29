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

                const actionsCell = createActionsCell(item.id);
                row.appendChild(actionsCell);

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

const createActionsCell = (id) => {
    const cell = document.createElement('td');
    cell.classList.add('actions');
    const actions = ['view', 'edit', 'delete'];
    actions.forEach(action => {
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
            .then(response => response.ok ? response.json() : Promise.reject('Failed to delete item'))
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

// Chart
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
