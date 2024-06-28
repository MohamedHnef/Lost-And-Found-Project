document.addEventListener("DOMContentLoaded", function () {
    const userId = 1; // Replace with actual user ID
    if (!userId) {
        console.error('User ID is missing');
        return;
    }
    populateTableWithData(userId);
});

const populateTableWithData = (userId) => {
    fetch(`https://lost-and-found-project-2.onrender.com/api/user-items?userId=${userId}`)
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

                const nameCell = document.createElement('td');
                nameCell.textContent = item.itemName;
                row.appendChild(nameCell);

                const categoryCell = document.createElement('td');
                categoryCell.textContent = item.category;
                row.appendChild(categoryCell);

                const colorCell = document.createElement('td');
                colorCell.textContent = item.color;
                row.appendChild(colorCell);

                const dateCell = document.createElement('td');
                const formattedDate = new Date(item.lostDate).toLocaleDateString('en-CA'); // Format date as YYYY-MM-DD
                dateCell.textContent = formattedDate;
                row.appendChild(dateCell);

                const locationCell = document.createElement('td');
                locationCell.textContent = item.locationLost;
                row.appendChild(locationCell);

                const statusCell = document.createElement('td');
                const statusButton = document.createElement('button');
                statusButton.textContent = item.status;
                statusButton.className = `statusProfile-btn statusProfile-${item.status.toLowerCase()}`;
                statusButton.style.fontSize = '12px'; // Make the button smaller
                statusCell.appendChild(statusButton);
                row.appendChild(statusCell);

                const actionsCell = document.createElement('td');
                actionsCell.classList.add('actions');

                const viewIcon = document.createElement('img');
                viewIcon.src = 'images/view-icon.png';
                viewIcon.alt = 'View';
                viewIcon.classList.add('action-icon');
                viewIcon.addEventListener('click', () => viewItem(item.id));
                actionsCell.appendChild(viewIcon);

                const editIcon = document.createElement('img');
                editIcon.src = 'images/edit-icon.png';
                editIcon.alt = 'Edit';
                editIcon.classList.add('action-icon');
                editIcon.addEventListener('click', () => editItem(item.id));
                actionsCell.appendChild(editIcon);

                const deleteIcon = document.createElement('img');
                deleteIcon.src = 'images/delete-icon.png';
                deleteIcon.alt = 'Delete';
                deleteIcon.classList.add('action-icon');
                deleteIcon.addEventListener('click', () => deleteItem(item.id));
                actionsCell.appendChild(deleteIcon);

                row.appendChild(actionsCell);
                reportsTbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
};

const viewItem = (id) => {
    window.location.href = `item.html?id=${id}`;
};

const editItem = (id) => {
    window.location.href = `edit_item.html?id=${id}`;
};

const deleteItem = (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
        fetch(`https://lost-and-found-project-2.onrender.com/api/items/${id}`, {
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