const API_URL = "https://localhost:4430/api/auth/";
const app = document.getElementById("app");

function isAuthentificated() {
    return localStorage.getItem("jwt") !== null;
}

function renderAuth() {
    app.innerHTML = `
        <div class="container">
            <h2>LOOOOOGIN</h2>
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

    const response = await fetch(API_URL + "token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem("jwt", data.access_token);
        renderGame();
    } else {
        alert("LOGIN FAILED");
        console.log(response);
    }
}

async function signup(event) {
    event.preventDefault();
    const username = document.getElementById("signup-username").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    const response = await fetch(API_URL + "signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
    });

    if (response.ok) {
        alert("Sign-up successful! You can now log in.");
    } else {
        alert("Sign-up failed! Try again.");
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

if (isAuthentificated()) {
    renderGame();
} else {
    renderAuth();
}
