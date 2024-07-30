document.addEventListener("DOMContentLoaded", () => {
    const role = sessionStorage.getItem('role');
    if (role) {
        toggleRoleView(role);
    }
    loadProfileInformation();
    if (document.getElementById('loginForm')) {
        toggleView('login');
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginFormSubmit, { once: true });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterFormSubmit, { once: true });
    }
});

function handleLoginFormSubmit(event) {
    event.preventDefault();
    console.log('Login form submitted');

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
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('userId', data.user.id);
            sessionStorage.setItem('role', data.user.role);
            sessionStorage.setItem('profilePicture', data.user.profile_pic);
            window.location.href = data.user.role === 'admin' ? 'adminHomePage.html' : 'homePage.html';
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


function toggleView(view) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');

    if (loginForm && registerForm && loginTab && registerTab) {
        if (view === 'login') {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
        } else {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            loginTab.classList.remove('active');
            registerTab.classList.add('active');
        }
    }
}



function handleRegisterFormSubmit(event) {
    event.preventDefault();
    console.log('Register form submitted');  // Debugging log

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

function toggleRoleView(role) {
    const adminLinks = document.getElementById('adminLinks');
    const userLinks = document.getElementById('userLinks');
    const adminLinksSide = document.getElementById('adminLinksSide');
    const userLinksSide = document.getElementById('userLinksSide');

    if (role === 'admin') {
        if (adminLinks) adminLinks.style.display = 'block';
        if (adminLinksSide) adminLinksSide.style.display = 'block';
    } else {
        if (userLinks) userLinks.style.display = 'block';
        if (userLinksSide) userLinksSide.style.display = 'block';
    }
}

function loadProfileInformation() {
    const username = sessionStorage.getItem('username');
    const profilePicture = sessionStorage.getItem('profilePicture');

    const usernameElem = document.getElementById('username');
    const sideUsernameElem = document.getElementById('sideUsername');
    const profileImgElem = document.getElementById('profileImg');
    const sideProfileImgElem = document.getElementById('sideProfileImg');

    if (usernameElem) usernameElem.textContent = username;
    if (sideUsernameElem) sideUsernameElem.textContent = username;
    if (profileImgElem) profileImgElem.src = profilePicture;
    if (sideProfileImgElem) sideProfileImgElem.src = profilePicture;
}

function handleLogout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
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
