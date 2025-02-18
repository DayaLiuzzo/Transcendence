import BaseView from './BaseView.js';


export default class SignUp extends BaseView{
    constructor(params){
        super(params);
    }

    showError(message){
        alert(message);
    }

    validateInputs(formData){
        if (!formData.username || formData.username.length < 3) return "Username must be at least 3 characters long.";
        if ((!formData.email || !formData.email.includes("@"))) return "Invalid email address.";
        if (formData.username.length > 128) return "Username must be at most 128 characters long.";
        if (!formData.password || !formData.password2 || formData.password.length < 6) return "Password must be at least 6 characters long.";
        if (formData.password !== formData.password2) return "Passwords do not match.";

        return null;
    }

    isAuthenticated() {
        return localStorage.getItem("jwt") !== null;
    }
    

    async sendSignUpRequest(formData){
        try {
            const response = await fetch(this.)
        }
        
    }
    async signup(formData) {
        console.log(formData.username, formData.email, formData.password, formData.password2);
        const errorMessage = this.validateInputs(formData);
        if (errorMessage) return this.showError(errorMessage);
        const signUpResponse = await this.sendSignUpRequest(formData);
        if (signUpResponse.error) return this.showError(signUpResponse.error);
    }

    getFormData(){
        return {
            username: document.getElementById("signup-username").value,
            email: document.getElementById("signup-email").value,
            password: document.getElementById("signup-password").value,
            password2: document.getElementById("signup-password2").value,
        };
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
            <input type="password" id="signup-password2" placeholder="Password2" required>
                <button type="submit">signup</button>
            </form>
        </div>
    `;
    }

    attachEvents(){
        console.log('Events attached (signup)');
        document.getElementById("signup-form").addEventListener("submit", (event) => {
            event.preventDefault();
            const formData = this.getFormData();
            this.signup(formData);
        });
    }
}