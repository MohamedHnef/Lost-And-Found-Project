function toggleView(view) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');

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

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        const profilePicInput = document.getElementById('profilePic');

        // Prepare a FormData object to send to the server
        const fullFormData = new FormData();
        fullFormData.append('username', data.username);
        fullFormData.append('email', data.email);
        fullFormData.append('phone', data.phone);
        fullFormData.append('password', data.password);

        // Append profile picture if provided
        if (profilePicInput.files.length > 0) {
            fullFormData.append('profilePic', profilePicInput.files[0]);
        }

        const response = await fetch('/api/register', {
            method: 'POST',
            body: fullFormData
        });

        const result = await response.json();
        if (response.ok) {
            alert('Registration successful');
            window.location.href = 'index.html';
        } else {
            alert(`Error: ${result.error}`);
        }
    });

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
    
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
    
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
    
            const result = await response.json();
            console.log(`Login Result: ${JSON.stringify(result)}`);
            if (response.ok) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('username', result.user.username);
                localStorage.setItem('profile_pic', result.user.profilePicture);
    
                // Check user role and redirect accordingly
                if (result.user.role === 'admin') {
                    window.location.href = 'adminPage.html';
                } else {
                    window.location.href = 'homePage.html';
                }
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            alert('An error occurred while logging in. Please try again.');
        }
    });
});

const handleLogin = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData))
    })
    .then(response => response.json())
    .then(data => {
        console.log('Login response:', data); // Debug log
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.user.role); // Store user role
            console.log('User role:', data.user.role); // Debug log
            if (data.user.role === 'admin') {
                window.location.href = 'adminPage.html'; // Redirect admin to admin page
            } else {
                window.location.href = 'profile.html'; // Redirect regular user to profile page
            }
        } else {
            alert('Login failed');
        }
    })
    .catch(error => console.error('Error logging in:', error));
};


