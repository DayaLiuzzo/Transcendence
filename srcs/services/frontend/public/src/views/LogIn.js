import BaseView from './BaseView.js';


export default class LogIn extends BaseView{
    constructor(params){
        super(params);
    }

    showError(message){
        alert(message);
    }

    validateInputs({ username, email, password }, isSignup = false){
        if (!username || username.length < 3) return "Username must be at least 3 characters long.";
        if (isSignup && (!email || !email.includes("@"))) return "Invalid email address.";
        if (!password || password.length < 6) return "Password must be at least 6 characters long.";
        return null;
    }

    async login(event){
        event.preventDefault();
        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;
        const validationError = this.validateInputs({ username, password });
        if (validationError) {
            this.showError(validationError);
            return;
        }
        try {
            const response = await fetch(this.API_URL + "token/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Login failed. Please check your credentials.");
            }
            localStorage.setItem("jwt", data.access_token);
            this.renderGame();
        } catch (error) {
            this.showError(error.message);
        }
    }

    async signup(event){
        event.preventDefault();
        const username = document.getElementById("signup-username").value;
        const email = document.getElementById("signup-email").value;
        const password = document.getElementById("signup-password").value;
        const validationError = this.validateInputs({ username, email, password }, true);
        if (validationError) {
            this.showError(validationError);
            return;
        }
        try {
            const response = await fetch(this.API_URL + "signup/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Signup failed. Please try again.");
            }
            localStorage.setItem("jwt", data.access_token);
            alert("Sign-up successful! You can now log in.");
        } catch (error) {
            this.showError(error.message);
        }
    }

    async renderGame(){
        return`
        <div class="container">
            <h2>Welcome to Pong!</h2>
            <button id="logout">Logout</button>
        </div>
    `;
    }

    isAuthenticated() {
        return localStorage.getItem("jwt") !== null;
    }
    
    async render(){
        if(this.isAuthenticated()){
            return await this.renderGame();
        } else { 
         return await this.renderAuth();
        }
    }

    async renderAuth(){
        return `
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

    }

    attachEvents(){
        if(!this.isAuthenticated()){
            document.getElementById("logout").addEventListener("click", () => {
                localStorage.removeItem("jwt");
            });
        }else {
            document.getElementById("login-form").addEventListener("submit", (event) => this.login(event));
            document.getElementById("signup-form").addEventListener("submit", (event) => this.signup(event));

        }
        console.log('Events attached (LogIn)');
    }
}