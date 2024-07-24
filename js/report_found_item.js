(function() {
    const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'https://lost-and-found-project.onrender.com/api';

    document.addEventListener("DOMContentLoaded", () => {
        const form = document.getElementById('reportFoundForm');
        form.addEventListener('submit', handleFormSubmit);
    });

    function handleFormSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const file = formData.get('addImage');

        if (!file || file.size === 0) {
            showNotification('Please upload an image.', 'error');
            return;
        }

        uploadImage(file).then(imageUrl => {
            console.log('Image URL:', imageUrl); // Debugging log
            submitFoundItemData(formData, imageUrl);
        }).catch(error => {
            console.error('Failed to upload image:', error);
            showNotification('Failed to upload image. Please try again.', 'error');
        });
    }

    function uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);
        return fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData
        }).then(response => {
            if (!response.ok) throw new Error('Image upload failed');
            return response.json();
        }).then(data => data.imageUrl);
    }

    function submitFoundItemData(formData, imageUrl) {
        const userId = 1; // Replace with actual user ID if available
        const itemData = {
            itemName: formData.get('itemName'),
            locationFound: formData.get('locationFound'),
            foundDate: formData.get('foundDate'),
            category: formData.get('category'),
            color: formData.get('color'),
            description: formData.get('description'),
            contactEmail: formData.get('contactEmail'),
            contactPhone: formData.get('contactPhone'),
            securityQuestion: formData.get('securityQuestion'),
            securityAnswer: formData.get('securityAnswer'),
            imageUrl: imageUrl,
            userId: userId
        };

        console.log('Item Data:', itemData); // Debugging log

        fetch(`${API_URL}/found-items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(itemData)
        }).then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || 'Failed to report found item');
                });
            }
            return response.json();
        }).then(() => {
            showNotification('Found item reported successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'list_Item.html';
            }, 2000);
        }).catch(error => {
            console.error('Failed to report found item:', error);
            showNotification(`Failed to report found item: ${error.message}`, 'error');
        });
    }

    function showNotification(message, type) {
        const notification = document.getElementById('notification');
        const notificationMessage = document.getElementById('notification-message');
        const notificationButton = document.getElementById('notification-button');

        notificationMessage.textContent = message;
        notificationButton.textContent = 'OK';

        notification.className = `notification ${type}`;
        notification.style.display = 'flex';

        notificationButton.style.display = 'block';
        notificationButton.onclick = () => {
            notification.style.display = 'none';
        };
    }
})();
