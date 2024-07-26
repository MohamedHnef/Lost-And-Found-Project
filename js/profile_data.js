const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'https://lost-and-found-project.onrender.com/api';

document.addEventListener("DOMContentLoaded", () => {
    const userId = 1; 
    if (!userId) {
        console.error('User ID is missing');
        return;
    }
    populateTableWithData(userId);
    initializeChart();
    initializeEditItemForm();
    initializeNotification();
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
            if (action === 'delete') confirmDeleteItem(id);
        });
        cell.appendChild(icon);
    });
    return cell;
};

const viewItem = (id) => window.location.href = `item.html?id=${id}`;

const editItem = (id) => {
    fetch(`${API_URL}/items/${id}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch item data');
            return response.json();
        })
        .then(item => {
            populateEditForm(item);
            const editModal = new bootstrap.Modal(document.getElementById('editItemModal'));
            editModal.show();
        })
        .catch(error => {
            console.error('Error fetching item data:', error);
            showNotification('Failed to fetch item data. Please try again.');
        });
};

const confirmDeleteItem = (id) => {
    showNotification('Are you sure you want to delete this item?', {
        yes: () => deleteItem(id),
        no: hideNotification
    });
};

const deleteItem = (id) => {
    fetch(`${API_URL}/items/${id}`, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) throw new Error('Failed to delete item');
            return response.json();
        })
        .then(() => {
            showNotification('Item deleted successfully', { ok: () => window.location.reload() });
        })
        .catch(error => {
            console.error('Error deleting item:', error);
            showNotification('Failed to delete item. Please try again.');
        });
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

const initializeEditItemForm = () => {
    const form = document.getElementById('editItemForm');
    form.addEventListener('submit', handleEditFormSubmit);
};

const populateEditForm = (item) => {
    document.getElementById('editItemId').value = item.id;
    document.getElementById('editItemName').value = item.itemName;
    document.getElementById('editLocationLost').value = item.locationLost;
    document.getElementById('editLostDate').value = item.lostDate ? item.lostDate.split('T')[0] : '';
    document.getElementById('editTimeLost').value = item.timeLost;
    document.getElementById('editCategory').value = item.category;
    document.getElementById('editItemColor').value = item.color;
    document.getElementById('editDescription').value = item.description;
    document.getElementById('editContactEmail').value = item.contactEmail;
    document.getElementById('editContactPhone').value = item.contactPhone;
};

const handleEditFormSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const itemId = formData.get('editItemId');

    // Prepare update data
    const updateData = {
        itemName: formData.get('editItemName'),
        locationLost: formData.get('editLocationLost'),
        category: formData.get('editCategory'),
        color: formData.get('editItemColor'),
        description: formData.get('editDescription'),
        contactEmail: formData.get('editContactEmail'),
        contactPhone: formData.get('editContactPhone')
    };

    if (formData.get('editLostDate')) {
        updateData.lostDate = formData.get('editLostDate');
    }
    if (formData.get('editTimeLost')) {
        updateData.timeLost = formData.get('editTimeLost');
    }

    // Handle file upload
    const file = formData.get('editAddImage');
    if (file && file.size > 0) {
        const uploadFormData = new FormData();
        uploadFormData.append('editAddImage', file);
        fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: uploadFormData
        })
        .then(response => response.json())
        .then(data => {
            updateData.imageUrl = data.imageUrl;
            submitUpdate(itemId, updateData);
        })
        .catch(error => {
            console.error('Error uploading image:', error);
            showNotification('Failed to upload image. Please try again.');
        });
    } else {
        submitUpdate(itemId, updateData);
    }
};

const submitUpdate = (itemId, updateData) => {
    fetch(`${API_URL}/items/${itemId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update item');
        }
        return response.json();
    })
    .then(() => {
        window.location.reload();
    })
    .catch(error => {
        console.error('Error updating item:', error);
        showNotification('Failed to update item. Please try again.');
    });
};

const initializeNotification = () => {
    const notification = document.getElementById('notification');
    const notificationYes = document.getElementById('notification-yes');
    const notificationNo = document.getElementById('notification-no');
    const notificationButton = document.getElementById('notification-button');
    notificationYes.addEventListener('click', () => {
        if (notification.confirmCallback) notification.confirmCallback();
        hideNotification();
    });
    notificationNo.addEventListener('click', hideNotification);
    notificationButton.addEventListener('click', hideNotification);
};

const showNotification = (message, actions = { yes: null, no: null, ok: null }) => {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    const notificationYes = document.getElementById('notification-yes');
    const notificationNo = document.getElementById('notification-no');
    const notificationButton = document.getElementById('notification-button');

    notificationMessage.textContent = message;

    if (actions.yes && actions.no) {
        notificationYes.style.display = 'block';
        notificationNo.style.display = 'block';
        notificationButton.style.display = 'none';
        notification.confirmCallback = actions.yes;
    } else {
        notificationYes.style.display = 'none';
        notificationNo.style.display = 'none';
        notificationButton.style.display = 'block';
        notification.confirmCallback = null;
        if (actions.ok) notificationButton.onclick = actions.ok;
    }

    notification.style.display = 'flex';
};

const hideNotification = () => {
    const notification = document.getElementById('notification');
    notification.style.display = 'none';
};
