const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'https://lost-and-found-project.onrender.com/api';

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('reportFoundForm');
    form.addEventListener('submit', handleFormSubmit);
    initializeNotification();
});

let isSubmitting = false; // Add a flag to prevent duplicate submissions

function getItemDataFromForm(formData, imageUrl) {
    const userId = localStorage.getItem('userId'); // Get the actual user ID from localStorage
    if (!userId) {
        alert('User ID is missing. Please log in again.');
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
        userId: userId // Use the actual user ID
    };
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
        localStorage.setItem('selectedItemId', data.id);
        localStorage.setItem('selectedItemStatus', 'Found');
        console.log('Item reported successfully:', data);
        isSubmitting = false; // Reset flag after successful submission
        return data;
    })
    .catch(handleError('Error submitting item data'));
}

function handleFormSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return; // Prevent duplicate submissions
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
        .then(() => {
            showNotification('Item reported successfully!', { ok: () => window.location.href = 'list_Item.html' });
        })
        .catch(error => {
            console.error('Failed to report item:', error);
            isSubmitting = false; // Reset flag in case of error
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
        isSubmitting = false; // Reset flag in case of error
        throw error;
    };
}

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
