import BaseView from './BaseView.js';


export default class EditProfile extends BaseView{
    constructor(router, params){
        super(router, params);
    }

    showError(message){
        alert(message);
    }

    containsSpecialCharacter(password) {
        const regex = /[@#$%^&*!]/; // Check for specific special characters
        return regex.test(password);
    }
    
    validateInputs(formData){
        if (!formData.username || formData.username.length < 3) return "Username must be at least 3 characters long.";
        if ((!formData.email || !formData.email.includes("@"))) return "Invalid email address.";
        if (formData.username.length > 128) return "Username must be at most 128 characters long.";
        if (!formData.password || !formData.password2 || formData.password.length < 6) return "Password must be at least 6 characters long.";
        if (formData.password !== formData.password2) return "Passwords do not match.";
        if (!this.containsSpecialCharacter(formData.password)) return "Password mustcontain special characters.";
        return null;
    }

    async EditProfile(formData) {
       
    }

    getFormData(){
        return {
            username: document.getElementById("EditProfile-username").value,
            email: document.getElementById("EditProfile-email").value,
            password: document.getElementById("EditProfile-password").value,
            password2: document.getElementById("EditProfile-password2").value,
        };
    }

    async render(){
        return `
        <div>
            <h2>EditProfile</h2>
            <h3> please just be ok</h3>
            <form id="EditProfile-form">
            <input type="text" id="EditProfile-username" placeholder="Username" required>
            <input type="email" id="EditProfile-email" placeholder="Email" required> 
            <input type="password" id="EditProfile-password" placeholder="Password" required>
            <input type="password" id="EditProfile-password2" placeholder="Password2" required>
                <button type="submit">EditProfile</button>
            </form>
        </div>
    `;
    }

    attachEvents(){
        console.log('Events attached (EditProfile)');
        document.getElementById("EditProfile-form").addEventListener("submit", (event) => {
            event.preventDefault();
            const formData = this.getFormData();
            this.EditProfile(formData);
        });
    }
}