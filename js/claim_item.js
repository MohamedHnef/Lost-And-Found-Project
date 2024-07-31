(function() {
    const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'https://lost-and-found-project.onrender.com/api';

    document.addEventListener("DOMContentLoaded", () => {
        const claimForm = document.getElementById('claimForm');
        if (claimForm) {
            claimForm.addEventListener('submit', handleClaimFormSubmit);
        }
    });

    function handleClaimFormSubmit(event) {
        event.preventDefault();
        const itemId = document.getElementById('itemId').value;
        const answer = document.getElementById('claimSecurityAnswer').value;

        fetch(`${API_URL}/claim-item/${itemId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ answer })
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to claim item');
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showNotification('Item claimed successfully!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                showNotification('Failed to claim item: ' + data.error, 'error');
            }
        })
        .catch(error => {
            console.error('Failed to claim item:', error);
            showNotification('Failed to claim item. Please try again.', 'error');
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

    // Function to show claim form
    window.showClaimForm = function(itemId, securityQuestion) {
        const claimSection = document.getElementById('claimSection');
        document.getElementById('itemId').value = itemId;
        document.getElementById('claimSecurityQuestion').value = securityQuestion;
        claimSection.style.display = 'block';
    };
})();
