document.addEventListener('DOMContentLoaded', () => {
    fetchNotifications();
});

async function fetchNotifications() {
    const userId = sessionStorage.getItem('userId');
    console.log(`Fetched userId from sessionStorage: ${userId}`);
    
    if (!userId) {
        console.error('User ID not found in sessionStorage');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/notifications/${userId}`);
        const text = await response.text();
        console.log('Response text:', text);
        
        if (response.ok) {
            const data = JSON.parse(text);
            if (!Array.isArray(data)) {
                console.error('Fetched data is not an array:', data);
                return;
            }
            console.log('Fetched notifications:', data);
            displayNotifications(data);
        } else {
            console.error('Failed to fetch notifications:', text);
        }
    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
}

function displayNotifications(notifications) {
    console.log('Notifications is an array with length:', notifications.length);
    
    const notificationList = document.getElementById('notificationList');
    notificationList.innerHTML = '';
    
    if (notifications.length === 0) {
        notificationList.innerHTML = '<p>No notifications</p>';
        return;
    }
    
    const notificationIds = notifications.map(notification => notification.id);
    console.log('Notification IDs to mark as read:', notificationIds);
    
    notifications.forEach(notification => {
        const listItem = document.createElement('li');
        listItem.innerHTML = notification.message; // Use innerHTML to include the link
        notificationList.appendChild(listItem);
    });
    
    markNotificationsAsRead(notificationIds);
}

async function markNotificationsAsRead(notificationIds) {
    if (notificationIds.length === 0) {
        console.log('No notification IDs to mark as read');
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
        console.log('Marked notifications as read:', data);
    } catch (error) {
        console.error('Error marking notifications as read:', error);
    }
}
