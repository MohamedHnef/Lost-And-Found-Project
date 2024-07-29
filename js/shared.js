// shared.js

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
            loginTab.classList.remove('active');
        } else {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            loginTab.classList.remove('active');
            registerTab.classList.add('active');
        }
    }
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

document.addEventListener("DOMContentLoaded", () => {
    const role = sessionStorage.getItem('role');
    if (role) {
        toggleRoleView(role);
    }
    loadProfileInformation();
    if (document.getElementById('loginForm')) {
        toggleView('login');
    }
});
