// Simulate login by sending credentials to the API and storing JWT tokens
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('https://localhost:4430/auth/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        const data = await response.json();
        // Save tokens in localStorage
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);

        // Show user profile with data
        showUserProfile();
    } else {
        alert('Login failed!');
    }
}

// Show the user profile after successful login
function showUserProfile() {
    // Hide the login form
    document.getElementById('login-form').style.display = 'none';

    // Show the user profile section
    document.getElementById('user-profile').style.display = 'block';

    // Get user data from the backend (this example assumes you have an endpoint to fetch user data)
    fetchUserProfile();
}

// Fetch user profile data from API
async function fetchUserProfile() {
    const token = localStorage.getItem('access_token');
    
    const response = await fetch('https://localhost:4430/api/profile/', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });

    if (response.ok) {
        const userData = await response.json();
        document.getElementById('user-name').innerText = `Hello, ${userData.username}!`;
    } else {
        alert('Failed to fetch user profile');
    }
}

// Logout and clear local storage
function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Show login form again
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('user-profile').style.display = 'none';
}
