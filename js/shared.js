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
            registerTab.classList.remove('active');
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

function updateHeaderAndFooterBasedOnRole() {
    const role = sessionStorage.getItem('role');
    const navLinks = document.getElementById('navLinks');
    const sideNavLinks = document.getElementById('sideNavLinks');
    const homeLink = document.getElementById('homeLink');
    const footer = document.getElementById('footer');

    if (role === 'admin') {
        homeLink.href = 'adminHomePage.html';
        navLinks.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" aria-current="page" href="adminHomePage.html">Home</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="manage_claims.html">Manage Claims</a>
            </li>
            <li class="nav-item dropdown profile-dropdown">
                <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <img src="" alt="Profile" class="profile-img rounded-circle me-2" id="profileImg">
                    <div class="profile-info">
                        <div id="username">Username</div>
                        <div class="text-muted">Admin</div>
                    </div>
                </a>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#">My Profile</a></li>
                    <li><a class="dropdown-item logout-link" href="index.html">Log Out</a></li>
                </ul>
            </li>
        `;
        sideNavLinks.innerHTML = `
            <li class="nav-item profile-dropdown">
                <div class="profile-info">
                    <img src="" alt="Profile" class="profile-img rounded-circle side" id="sideProfileImg">
                    <div id="sideUsername">Username</div>
                </div>
            </li>
            <li class="nav-item">
                <a class="nav-link side" aria-current="page" href="adminHomePage.html">
                    <i class="bi bi-house"></i> Home
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link side" href="manage_claims.html">
                    <i class="bi bi-check-circle"></i> Manage Claims
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link side" href="profile.html">
                    <i class="bi bi-person"></i> My Profile
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link side logout-link" href="#">
                    <i class="bi bi-box-arrow-right"></i> Log Out
                </a>
            </li>
        `;
        footer.innerHTML = `<div class="container">
            <span class="text-muted">Lost and Found © 2024</span>
        </div>`;
    } else {
        homeLink.href = 'homePage.html';
        navLinks.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" aria-current="page" href="homePage.html">Home</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="report_lost.html">Report Lost</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#">Report Found</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#">Set Reminders</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#">Add Feedback</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#"><img src="images/bell-icon.png" alt=""></a>
            </li>
            <li class="nav-item dropdown profile-dropdown">
                <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <img src="" alt="Profile" class="profile-img rounded-circle me-2" id="profileImg">
                    <div class="profile-info">
                        <div id="username">Username</div>
                        <div class="text-muted">Connected</div>
                    </div>
                </a>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#">Settings</a></li>
                    <li><a class="dropdown-item" href="profile.html">My Profile</a></li>
                    <li><a class="dropdown-item" href="#">Log Out</a></li>
                </ul>
            </li>
        `;
        sideNavLinks.innerHTML = `
            <li class="nav-item profile-dropdown">
                <div class="profile-info">
                    <img src="" alt="Profile" class="profile-img rounded-circle side" id="sideProfileImg">
                    <div id="sideUsername">Username</div>
                </div>
            </li>
            <li class="nav-item">
                <a class="nav-link side" aria-current="page" href="homePage.html">
                    <i class="bi bi-house"></i> Home
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link side" href="report_lost.html">
                    <i class="bi bi-search"></i> Report Lost
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link side" href="#">
                    <i class="bi bi-bell"></i> Report Found
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link side" href="#">
                    <i class="bi bi-clock"></i> Set Reminders
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link side" href="#">
                    <i class="bi bi-chat"></i> Add Feedback
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link side" href="profile.html">
                    <i class="bi bi-person"></i> My Profile
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link side logout-link" href="#">
                    <i class="bi bi-box-arrow-right"></i> Log Out
                </a>
            </li>
        `;
        footer.innerHTML = `<div class="container">
            <span class="text-muted">Lost and Found © 2024</span>
        </div>`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const role = sessionStorage.getItem('role');
    if (role) {
        toggleRoleView(role);
    }
    loadProfileInformation();
    updateHeaderAndFooterBasedOnRole();
    if (document.getElementById('loginForm')) {
        toggleView('login');
    }
});
