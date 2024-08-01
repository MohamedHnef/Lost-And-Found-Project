const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'https://lost-and-found-project.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {
    fetchNotifications();
});

async function fetchNotifications() {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        console.error('User ID not found in sessionStorage');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/notifications/${userId}`);
        const data = await response.json();
        
        if (!Array.isArray(data)) {
            console.error('Fetched data is not an array:', data);
            return;
        }
        displayNotifications(data);
    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
}

function displayNotifications(notifications) {
    const notificationList = document.getElementById('notificationList');
    notificationList.innerHTML = '';
    
    if (notifications.length === 0) {
        notificationList.innerHTML = '<p>No notifications</p>';
        return;
    }
    
    const notificationIds = notifications.map(notification => notification.id);
    notifications.forEach(notification => {
        const listItem = document.createElement('li');
        listItem.innerHTML = notification.message; 
        notificationList.appendChild(listItem);
    });
    
    markNotificationsAsRead(notificationIds);
}

async function markNotificationsAsRead(notificationIds) {
    if (notificationIds.length === 0) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/notifications/mark-read`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ notificationIds })
        });
        const data = await response.json();
    } catch (error) {
        console.error('Error marking notifications as read:', error);
    }
}
