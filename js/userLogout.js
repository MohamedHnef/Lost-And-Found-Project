

function logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('profile_pic');
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const logoutLinks = document.querySelectorAll('.nav-link[href="#logout"], .dropdown-item[href="#logout"]');
    logoutLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    });

    const username = sessionStorage.getItem('username');
    const profilePic = sessionStorage.getItem('profile_pic');

    if (username) {
        document.getElementById('username').innerText = username;
        document.getElementById('sideUsername').innerText = username;
    }
    if (profilePic) {
        document.getElementById('profileImg').src = profilePic;
        document.getElementById('sideProfileImg').src = profilePic;
    }
});
