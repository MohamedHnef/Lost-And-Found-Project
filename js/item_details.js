(function() {
    const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'https://lost-and-found-project.onrender.com/api';

    document.addEventListener('DOMContentLoaded', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const selectedItemId = urlParams.get('id');
        const selectedItemStatus = urlParams.get('status');

        if (selectedItemId && selectedItemStatus) {
            fetchItemDetails(selectedItemId, selectedItemStatus);
        } else {
            displayNoItemSelected();
        }

        const claimButton = document.getElementById('claim-button');
        if (claimButton) {
            claimButton.addEventListener('click', () => {
                showSecurityQuestionModal(selectedItemId, selectedItemStatus);
            });
        }

        const submitAnswerButton = document.getElementById('submit-answer');
        if (submitAnswerButton) {
            submitAnswerButton.addEventListener('click', () => {
                submitSecurityAnswer(selectedItemId, selectedItemStatus);
            });
        }

        const closeModalButton = document.querySelector('.modal .btn-close');
        if (closeModalButton) {
            closeModalButton.addEventListener('click', () => {
                document.getElementById('security-question-modal').style.display = 'none';
            });
        }
    });

    const fetchItemDetails = (id, status) => {
        const url = status === 'Found' ? `${API_URL}/found-items/${id}` : `${API_URL}/lost-items/${id}`;
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Item not found');
                }
                return response.json();
            })
            .then(item => {
                displayItemDetails(item);
                if (status === 'Found') {
                    document.getElementById('claim-button').style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                displayNoItemDetails();
            });
    };

    const displayItemDetails = (item) => {
        if (item) {
            document.getElementById('item-details-box').innerHTML = getItemDetailsHTML(item);
            document.getElementById('item-description-box').innerHTML = getItemDescriptionHTML(item);
        } else {
            displayNoItemDetails();
        }
    };

    const getItemDetailsHTML = (item) => `
        <h3>Report Information</h3>
        <div class="item-details">
            <div class="item-detail"><strong>Item Name</strong><span>${item.itemName}</span></div>
            <div class="item-detail"><strong>Category</strong><span>${item.category}</span></div>
            <div class="item-detail"><strong>Color</strong><span>${item.color}</span></div>
            <div class="item-detail"><strong>Date</strong><span>${formatDate(item.foundDate || item.lostDate)}</span></div>
            <div class="item-detail"><strong>Status</strong><span>${item.status}</span></div>
            <div class="item-detail"><strong>Location</strong><span>${item.locationFound || item.locationLost}</span></div>
        </div>
    `;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getItemDescriptionHTML = (item) => `
        <h3>Report Information</h3>
        <p>${item.description || 'No description provided.'}</p>
        <img src="${item.imageUrl}" alt="${item.itemName}" class="img-fluid">
    `;

    const displayNoItemDetails = () => {
        document.getElementById('item-details-box').innerHTML = '<p>No item details available.</p>';
        document.getElementById('item-description-box').innerHTML = '<p>No item details available.</p>';
    };

    const displayNoItemSelected = () => {
        document.getElementById('item-details-box').innerHTML = '<p>No item selected.</p>';
        document.getElementById('item-description-box').innerHTML = '<p>No item selected.</p>';
    };

    const showSecurityQuestionModal = (id, status) => {
        fetch(`${API_URL}/items/${id}?status=${status}`)
            .then(response => response.json())
            .then(item => {
                document.getElementById('security-question').innerText = item.securityQuestion;
                document.getElementById('security-question-modal').style.display = 'block';
            })
            .catch(error => {
                console.error('Error fetching security question:', error);
            });
    };

    const submitSecurityAnswer = (id, status) => {
        const answer = document.getElementById('security-answer').value;
        fetch(`${API_URL}/claim-item/${id}?status=${status}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ answer })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                showNotification('Your claim request will be reviewed by the admin.');
                document.getElementById('security-question-modal').style.display = 'none';
            } else {
                showNotification('Incorrect answer. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error submitting answer:', error);
        });
    };

    const showNotification = (message) => {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                <p>${message}</p>
                <div class="notification-actions">
                    <button class="btn btn-primary" onclick="closeNotificationAndRedirect()">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(notification);
    };

    window.closeNotificationAndRedirect = () => {
        document.querySelector('.notification').remove();
        window.location.href = 'homePage.html'; // Redirect to home page
    };
})();
