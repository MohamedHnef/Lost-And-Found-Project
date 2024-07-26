function setAdminView() {
    const userRole = localStorage.getItem('role');
    if (userRole == 'admin') {
        document.getElementById('navbar-title').textContent = 'Lost And Fount - Admin';
        document.getElementById('nav-items').innerHTML = `
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
                    <li><a class="dropdown-item" href="profile.html">My Profile</a></li>
                    <li><a class="dropdown-item logout-link" href="index.html">Log Out</a></li>
                </ul>
            </li>
        `;
        document.getElementById('side-nav-items').innerHTML = `
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
                <a class="nav-link side" href="#">
                    <i class="bi bi-person"></i> My Profile
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link side logout-link" href="#">
                    <i class="bi bi-box-arrow-right"></i> Log Out
                </a>
            </li>
        `;
        document.getElementById('breadcrumb').innerHTML = `
            <li class="breadcrumb-item"><a href="adminHomePage.html">Home</a></li>
            <li class="breadcrumb-item active" aria-current="page">Item</li>
        `;
    }
}