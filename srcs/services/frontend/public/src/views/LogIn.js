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

    isAuthenticated() {
        return localStorage.getItem("jwt") !== null;
    }

    
    async login(event) {
        event.preventDefault();
    }

    async render(){
        return `
        <div>
            <h2>Login</h2>
            <h3> please just be ok</h3>
            <form id="login-form">
                <input type="text" id="login-username" placeholder="Username" required>
                <input type="password" id="login-password" placeholder="Password" required>
                <button type="submit">Login</button>
            </form>
        </div>
    `;
    }

    async attachEvents(){
        console.log('Events attached (LogIn)');
        document.getElementById("login-form").addEventListener("submit", this.login);
    }
}