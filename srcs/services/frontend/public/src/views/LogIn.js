import BaseView from './BaseView.js';


export default class LogIn extends BaseView{
    constructor(router, params){
        super(router, params);
    }

    showError(message){
        alert(message);
    }

    validateInputs(formData){
        if (!formData.username || formData.username.length < 3) return "Username must be at least 3 characters long.";
        if (formData.username.length > 128) return "Username must be at most 128 characters long.";
        if (!formData.password || formData.password.length < 6) return "Password must be at least 6 characters long.";

        return null;
    }

    isAuthenticated() {
        return localStorage.getItem("jwt") !== null;
    }

    getFormData(){
        return {
            username: document.getElementById("login-username").value,
            password: document.getElementById("login-password").value,
            // two_factor: document.getElementById("login-two-factor").value,
        };
    }

    async login(formData) {
        console.log(formData)
        const errorMessage = this.validateInputs(formData);
        if (errorMessage) return this.showError(errorMessage)
        const loginResponse = await this.sendPostRequest(this.API_URL_LOGIN, formData);
        if (!loginResponse.success) return this.showError(JSON.stringify(loginResponse.error, null, 2));
        console.log(loginResponse.data);
        this.navigateTo("/home");
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
        document.getElementById("login-form").addEventListener("submit", (event) => {
            event.preventDefault();
            const formData = this.getFormData();
            this.login(formData);
        });
    }
}