import BaseView from './BaseView.js';


export default class SignUp extends BaseView{
    constructor(router, params){
        super(router, params);
        this.handleSignupSubmit = this.handleSignupSubmit.bind(this);
    }

    containsSpecialCharacter(password) {
        const regex = /[@#$%^&*!]/; // Check for specific special characters
        return regex.test(password);
    }
    
    validateInputs(formData){
        if (!formData.username || formData.username.length < 3) return "Username must be at least 3 characters long.";
        if ((!formData.email || !formData.email.includes("@"))) return "Invalid email address.";
        if (formData.username.length > 32) return "Username must be at most 32 characters long.";
        if (!formData.password || !formData.password2 || formData.password.length < 6) return "Password must be at least 6 characters long.";
        if (formData.password !== formData.password2) return "Passwords do not match.";
        if (!this.containsSpecialCharacter(formData.password)) return "Password must contain one of the following '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '+', '='";
        return null;
    }

    handleSignupSubmit(event){
        event.preventDefault();
        const formData = this.getFormData();
        this.signup(formData);
    }

    async signup(formData) {
        const errorMessage = this.validateInputs(formData);
        if (errorMessage) return this.showError(errorMessage);
        const signUpResponse = await this.sendPostRequest(this.API_URL_SIGNUP, formData);
        if (!signUpResponse.success) return this.showError(signUpResponse.error);
        this.navigateTo("/log-in");
    }

    getFormData(){
        return {
            username: document.getElementById("signup-username").value,
            email: document.getElementById("signup-email").value,
            password: document.getElementById("signup-password").value,
            password2: document.getElementById("signup-password2").value,
        };
    }

    getErrorContainer() {
        let errorContainer = document.getElementById("signup-error-container");

        if (!errorContainer) {
            errorContainer = document.createElement("div");
            errorContainer.id = "signup-error-container";  // Set a unique ID
            errorContainer.classList.add("error-container");  // Optional: Add a class for styling
            document.getElementById("signup-form").insertBefore(errorContainer, document.getElementById("signup-form").firstChild); // Insert at the top of the form
        }

        return errorContainer;
    }



    render(){
        return `
        <div>
        	<div id="header">
                <div>
                    <button id="button-nav">
                    <i class="menuIcon material-icons">menu</i>
                    <i class="closeIcon material-icons" style="display: none;" >close</i>
                    </button>
                    <nav id="navbar">
                    </nav>
                </div>
                <div id="line"></div>
                </div>          
            </div>
            <div id="container">
                <h2>Sign-up</h2>
                <form id="signup-form">
                <input type="text" id="signup-username" placeholder="Username" required>
                <input type="email" id="signup-email" placeholder="Email" required> 
                <input type="password" id="signup-password" placeholder="Password" required>
                <input type="password" id="signup-password2" placeholder="Confim password" required>
                    <button type="submit">Sign-up</button>
                </form>
            </div>
        </div>
    `;
    }

    unmount(){
        // console.log('unmounting signup');
        document.getElementById("signup-form")?.removeEventListener("submit", this.handleSignupSubmit);
    }

    attachEvents(){
        // console.log('Events attached (signup)');
        document.getElementById("signup-form")?.addEventListener("submit", this.handleSignupSubmit);
    }


}