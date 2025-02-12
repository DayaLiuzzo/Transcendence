const API_URL = "https://localhost:4430/api/auth/";
const app = document.getElementById("app");

function isAuthenticated() {
    return localStorage.getItem("jwt") !== null;
}

function showError(message) {
    alert(message);
}
// Je me demande si on peut pas juste reutiliser les erreurs envoyees avec les methodes implementees plutot que
// parser a nouveau ici ???
function validateInputs({ username, email, password }, isSignup = false) {
    if (!username || username.length < 3) return "Username must be at least 3 characters long.";
    if (isSignup && (!email || !email.includes("@"))) return "Invalid email address.";
    if (!password || password.length < 6) return "Password must be at least 6 characters long.";
    return null;
}

function renderAuth() {
    app.innerHTML = `
        <div class="container">
            <h2>Login</h2>
            <form id="login-form">
                <input type="text" id="login-username" placeholder="Username" required>
                <input type="password" id="login-password" placeholder="Password" required>
                <button type="submit">Login</button>
            </form>

            <h2>Sign Up</h2>
            <form id="signup-form">
                <input type="text" id="signup-username" placeholder="Username" required>
                <input type="email" id="signup-email" placeholder="Email" required>
                <input type="password" id="signup-password" placeholder="Password" required>
                <button type="submit">Sign Up</button>
            </form>
        </div>
    `;

    document.getElementById("login-form").addEventListener("submit", login);
    document.getElementById("signup-form").addEventListener("submit", signup);
}

async function login(event) {
    event.preventDefault();

    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    const validationError = validateInputs({ username, password });
    if (validationError) {
        showError(validationError);
        return;
    }

    try {
        const response = await fetch(API_URL + "token/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Login failed. Please check your credentials.");
        }

        localStorage.setItem("jwt", data.access_token);
        renderGame();
    } catch (error) {
        showError(error.message);
    }
}

async function signup(event) {
    event.preventDefault();

    const username = document.getElementById("signup-username").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    const validationError = validateInputs({ username, email, password }, true);
    if (validationError) {
        showError(validationError);
        return;
    }

    try {
        const response = await fetch(API_URL + "signup/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Sign-up failed. Please try again.");
        }

        alert("Sign-up successful! You can now log in.");
    } catch (error) {
        showError(error.message);
    }
}

function renderGame() {
    app.innerHTML = `
        <div class="container">
            <h2>Welcome to Pong!</h2>
            <button id="logout">Logout</button>
        </div>
    `;

    document.getElementById("logout").addEventListener("click", () => {
        localStorage.removeItem("jwt");
        renderAuth();
    });
}


if (isAuthenticated()) {
    renderGame();
} else {
    renderAuth();
}
