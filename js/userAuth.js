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
                localStorage.setItem('role', result.user.role); // Store the user's role

                // Check user role and redirect accordingly
                if (result.user.role === 'admin') {
                    window.location.href = 'adminHomePage.html';
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
