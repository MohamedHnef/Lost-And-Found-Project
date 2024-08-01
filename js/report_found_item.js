const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'https://lost-and-found-project.onrender.com/api';

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('reportFoundForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit, { once: true });
    }
    initializeNotification();
});

let isSubmitting = false;

function handleFormSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;

    const formData = new FormData(event.target);
    const file = formData.get('image');

    if (!file || file.size === 0) {
        showNotification('Please upload an image.');
        isSubmitting = false;
        return;
    }

    uploadImage(file)
        .then(imageUrl => {
            const itemData = getItemDataFromForm(formData, imageUrl);
            return submitItemData(itemData);
        })
        .then(data => {
            sendEmailNotification(data.id); 
            showNotification('Item reported successfully!', { ok: () => window.location.href = 'list_Item.html' });
        })
        .catch(error => {
            console.error('Failed to report item:', error);
            isSubmitting = false;
            showNotification('Failed to report item. Please try again.');
        });
}

function uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    return fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData
    })
    .then(handleResponse)
    .then(data => data.imageUrl)
    .catch(handleError('Error uploading image'));
}

function getItemDataFromForm(formData, imageUrl) {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        showNotification('User ID is missing. Please log in again.');
        throw new Error('User ID is missing.');
    }
    return {
        itemName: formData.get('itemName'),
        locationFound: formData.get('locationFound'),
        foundDate: formData.get('foundDate'),
        foundTime: formData.get('foundTime'),
        category: formData.get('category'),
        color: formData.get('color'),
        description: formData.get('description'),
        contactEmail: formData.get('contactEmail'),
        contactPhone: formData.get('contactPhone'),
        securityQuestion: formData.get('securityQuestion'),
        securityAnswer: formData.get('securityAnswer'),
        status: 'Found',
        imageUrl: imageUrl,
        userId: userId
    };
}

function submitItemData(itemData) {
    return fetch(`${API_URL}/found-items`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemData)
    })
    .then(handleResponse)
    .then(data => {
        sessionStorage.setItem('selectedItemId', data.id);
        sessionStorage.setItem('selectedItemStatus', 'Found');
        isSubmitting = false;
        return data;
    })
    .catch(handleError('Error submitting item data'));
}

function sendEmailNotification(itemId) {
    fetch(`${API_URL}/item-found`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('api_key')}` 
        },
        body: JSON.stringify({ itemId })
    })
    .then(response => response.text()) 
    .then(text => {
        try {
            const data = JSON.parse(text); 
        } catch (error) {
            console.warn('Response is not valid JSON:', text);
        }
    })
    .catch(error => {
        console.error('Error sending notification email:', error);
    });
}


function handleResponse(response) {
    if (!response.ok) {
        throw new Error(`Failed, server responded with status: ${response.status}`);
    }
    return response.json();
}

function handleError(message) {
    return error => {
        console.error(message, error);
        showNotification(message);
        isSubmitting = false;
        throw error;
    };
}

function initializeNotification() {
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
}

function showNotification(message, actions = { yes: null, no: null, ok: null }) {
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
}

function hideNotification() {
    const notification = document.getElementById('notification');
    notification.style.display = 'none';
}