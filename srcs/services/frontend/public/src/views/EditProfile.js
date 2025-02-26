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
        if (!formData.new_password || !formData.new_password2 || formData.new_password.length < 6) return "Password must be at least 6 characters long.";
        if (formData.new_password !== formData.new_password2) return "Passwords do not match.";
        if (!this.containsSpecialCharacter(formData.new_password)) return "Password mustcontain special characters.";
        return null;
    }

    async EditProfile(formData) {
       
    }

    async changePassword(formData) {
        const error = this.validateInputs(formData);
        if (error) {
            this.showError(error);
            return;
        }
        const username = this.getUsername();
        const response = await this.sendPatchRequest(this.API_URL + "change-password/" + username + "/", formData);
        if (response.error) {
            this.showError(response.error);
            return;
        }
        alert("Password changed successfully");
        this.navigateTo("/profile");
        
    }

    getPasswordFormData(){
        return {
            password: document.getElementById("EditProfile-password").value,
            new_password: document.getElementById("EditProfile-new_password").value,
            new_password2: document.getElementById("EditProfile-new_password2").value,
        };
    }

    getUsernameFormData(){
        return {
            username: document.getElementById("EditProfile-password").value,
            new_password: document.getElementById("EditProfile-new_password").value,
        };
    }

    async render(){
        return `
        <div>
            <h2>EditProfile</h2>
            <h3>change password</h3>
            <form id="change-password-form">
            <input type="password" id="EditProfile-password" placeholder="Old Password" required>
            <input type="password" id="EditProfile-new_password" placeholder="new_Password" required>
            <input type="password" id="EditProfile-new_password2" placeholder="new_Password2" required>
                <button type="submit">Change Password</button>
            </form>
            <h3>change username</h3>
            <form id="change-username-form">
            <input type="text" id="EditProfile-username" placeholder="Username" required>
            <input type="text" id="EditProfile-username2" placeholder="Username2" required>
                <button type="submit">Change Username</button>
            </form>
        </div>
    `;
    }

    attachEvents(){
        console.log('Events attached (EditProfile)');
        document.getElementById("change-password-form").addEventListener("submit", (event) => {
            event.preventDefault();
            const formData = this.getPasswordFormData();
            this.changePassword(formData);
        });
        document.getElementById("change-username-form").addEventListener("submit", (event) => {
            event.preventDefault();
            const formData = this.getFormData();
            this.EditProfile(formData);
        });
    }
}