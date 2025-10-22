// Check if development mode bypass is available
window.addEventListener('DOMContentLoaded', () => {
    // Add bypass button for development
    const loginBox = document.querySelector('.login-box');
    const bypassBtn = document.createElement('button');
    bypassBtn.textContent = 'Quick Login (Dev Mode)';
    bypassBtn.className = 'btn btn-secondary';
    bypassBtn.style.marginTop = '10px';
    bypassBtn.style.width = '100%';
    bypassBtn.onclick = (e) => {
        e.preventDefault();
        bypassLogin();
    };
    loginBox.querySelector('form').appendChild(bypassBtn);
});

// Bypass login for development
function bypassLogin() {
    // Create a mock user
    const mockUser = {
        id: 1,
        email: 'dev@example.com',
        name: 'Developer',
        role: 'manager'
    };

    // Create a mock token
    const mockToken = 'dev-mode-token-' + Date.now();

    // Store in localStorage
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));

    // Redirect to dashboard
    window.location.href = '/dashboard';
}

// Login Form Handler
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Store token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect to dashboard
            window.location.href = '/dashboard';
        } else {
            // Show error message
            errorMessage.textContent = data.error || 'Login failed';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.style.display = 'block';
    }
});
