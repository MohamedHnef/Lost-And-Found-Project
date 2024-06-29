const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'https://lost-and-found-project.onrender.com/api';

document.addEventListener("DOMContentLoaded", function () {
    const userId = 1; // Replace with actual user ID
    if (!userId) return console.error('User ID is missing');
    fetchUserItems(userId);
    initializeChart();
});

const fetchUserItems = (userId) => {
    fetch(`${API_URL}/user-items?userId=${userId}`)
        .then(response => response.json())
        .then(data => updateTable(data))
        .catch(error => console.error('Error fetching data:', error));
};

const updateTable = (data) => {
    const reportsTbody = document.getElementById('reports-tbody');
    if (!reportsTbody) return console.error('Reports tbody element not found');
    reportsTbody.innerHTML = ''; 
    data.forEach(item => reportsTbody.appendChild(createTableRow(item)));
};

const createTableRow = (item) => {
    const row = document.createElement('tr');
    const cells = ['itemName', 'category', 'color', 'lostDate', 'locationLost', 'status'].map(key => createCell(item[key], key));
    cells.forEach(cell => row.appendChild(cell));
    row.appendChild(createActionsCell(item.id));
    return row;
};

const createCell = (value, key) => {
    const cell = document.createElement('td');
    if (key === 'lostDate') cell.textContent = new Date(value).toLocaleDateString('en-CA');
    else if (key === 'status') {
        const button = document.createElement('button');
        button.textContent = value;
        button.className = `statusProfile-btn statusProfile-${value.toLowerCase()}`;
        button.style.fontSize = '12px';
        cell.appendChild(button);
    } else cell.textContent = value;
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
        icon.addEventListener('click', () => window[`${action}Item`](id));
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
