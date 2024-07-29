
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginFormSubmit);
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterFormSubmit);
    }
});

function handleLoginFormSubmit(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.user.id); // Store userId
            window.location.href = 'homePage.html';
        } else {
            console.error('Login failed:', data.error);
            showNotification('Login failed. Please check your username and password.');
        }
    })
    .catch(error => {
        console.error('Error during login:', error);
        showNotification('An error occurred during login. Please try again.');
    });
}


function handleRegisterFormSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    fetch('/api/register', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.id) {
            showNotification('Registration successful! Please log in.', {
                ok: () => window.location.href = 'index.html'
            });
        } else {
            console.error('Registration failed:', data.error);
            showNotification('Registration failed. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error during registration:', error);
        showNotification('An error occurred during registration. Please try again.');
    });
}

function showNotification(message, actions = { ok: null }) {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    const notificationButton = document.getElementById('notification-button');

    notificationMessage.textContent = message;
    notificationButton.style.display = 'block';

    if (actions.ok) {
        notificationButton.onclick = actions.ok;
    } else {
        notificationButton.onclick = () => notification.style.display = 'none';
    }

    notification.style.display = 'flex';
}
