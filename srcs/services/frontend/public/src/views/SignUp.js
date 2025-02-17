import BaseView from './BaseView.js';


export default class SignUp extends BaseView{
    constructor(params){
        super(params);
    }

    showError(message){
        alert(message);
    }

    validateInputs({ username, email, password }){
        if (!username || username.length < 3) return "Username must be at least 3 characters long.";
        if ((!email || !email.includes("@"))) return "Invalid email address.";
        if (!password || password.length < 6) return "Password must be at least 6 characters long.";
        return null;
    }

    isAuthenticated() {
        return localStorage.getItem("jwt") !== null;
    }
    
    async signup(event) {
        event.preventDefault();
        
        const username = document.getElementById("signup-username").value;
        const email = document.getElementById("signup-email").value;
        const password = document.getElementById("signup-password").value;
        const password2 = document.getElementById("signup-password2").value;

        console.log(username, email, password, password2);
    }

    async render(){
        return `
        <div>
            <h2>signup</h2>
            <h3> please just be ok</h3>
            <form id="signup-form">
            <input type="text" id="signup-username" placeholder="Username" required>
            <input type="email" id="signup-email" placeholder="Email" required> 
            <input type="password" id="signup-password" placeholder="Password" required>
            <input type="password2" id="signup-password2" placeholder="Password2" required>
                <button type="submit">signup</button>
            </form>
        </div>
    `;
    }

    async attachEvents(){
        console.log('Events attached (signup)');
        document.getElementById("signup-form").addEventListener("submit", this.signup);
    }
}