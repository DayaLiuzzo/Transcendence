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

    validateUsername(formData){
        if (!formData.username) return "Username cannot be empty.";
        if (formData.username.length < 4) return "Username must be at least 6 characters long.";
        if (formData.username === this.getUsername()) return "Username cannot be the same as the current one.";
        if (this.containsSpecialCharacter(formData.username)) return "Username can't contain special characters.";
        if (formData.username > 20) return "Username must be less than 20 characters long.";
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

    async changeUsername(formData) {
        const error = this.validateUsername(formData);
        if (error){
            this.showError(error);
            return;
        }
        const username = this.getUsername();
        const body = {
            old_username: username,
            username: username,
            new_username: formData.username,
        }
        const response = await this.sendPatchRequest(this.API_URL + "update/" + username + "/", body);
        if(!response.success)
        {
            this.showError(response.error);
            return;
        }
        alert(response.data.message);
        let userSession = JSON.parse(sessionStorage.getItem("userSession"));
        userSession.username = formData.username;
        userSession.access_token = response.data.access_token;
        userSession.refresh_token = response.data.refresh_token;
        sessionStorage.setItem("userSession", JSON.stringify(userSession));
        if(userSession.two_factor_enabled){
            alert(response.data.otp)
            this.navigateTo("/profile");            
        }
        else
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
            username: document.getElementById("EditProfile-username").value,
        };
    }

    render(){
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
            <div id="username-field"></div>
            <form id="change-username-form">
            <input type="text" id="EditProfile-username" placeholder="Username" required>
                <button type="submit">Change Username</button>
            </form>
            <button id="toggle-2fa-button">Enable 2FA</button>
            <input type="file" id="avatar-upload" accept="image/*" />
            <button id="upload-avatar-btn">Upload Avatar</button>
        </div>
    `;
    }

    async attachEvents(){
        console.log('Events attached (EditProfile)');
        document.getElementById("change-password-form").addEventListener("submit", (event) => {
            event.preventDefault();
            const formData = this.getPasswordFormData();
            this.changePassword(formData);
        });
        document.getElementById("change-username-form").addEventListener("submit", (event) => {
            event.preventDefault();
            const formData = this.getUsernameFormData();
            this.changeUsername(formData);
        });
        document.getElementById("toggle-2fa-button").addEventListener("click", async () => {
            if (document.getElementById("toggle-2fa-button").textContent === "Enable 2FA") {
                const body = {
                    enable: true
                }
                const response = await this.sendPostRequest(this.API_URL + "2fa/setup/", body);
                if (response.error) {
                    this.showError(response.error);
                    return;
                }
                let userSession = JSON.parse(sessionStorage.getItem("userSession"));
                userSession.two_factor_enabled = true;
                sessionStorage.setItem("userSession", JSON.stringify(userSession));
                alert(response.data.otp_secret);
                document.getElementById("toggle-2fa-button").textContent = "Disable 2FA";
            }
            else{
                const body = {
                    enable: false
                }
                const response = await this.sendPostRequest(this.API_URL + "2fa/setup/", body);
                if (response.error) {
                    this.showError(response.error);
                    return;
                }
                let userSession = JSON.parse(sessionStorage.getItem("userSession"));
                userSession.two_factor_enabled = false;
                sessionStorage.setItem("userSession", JSON.stringify(userSession));
                alert(response.data.message);
                document.getElementById("toggle-2fa-button").textContent = "Enable 2FA";

            }


        });
        
        document.getElementById("upload-avatar-btn").addEventListener("click", async () => {
        const fileInput = document.getElementById("avatar-upload");
        const file = fileInput.files[0];

        if (!file) {
            alert("Please select an avatar image first!");
            return;
        }
        const formData = new FormData();
        formData.append("avatar", file);
        const response = await this.uploadAvatar(this.API_URL_AVATAR, formData);
        if (!response.success) {
            this.showError(response.error);
            console.log("ERROR")
            return;
        }
        console.log(response.data.status)
        });

        }

        async mount(){
        try {
            const username = this.getUsername();
            this.updateFieldContent("username-field", this.formatField("username", username));
            const userData = await this.sendGetRequest(this.API_URL + username + '/');
            if(userData.data.two_factor_enabled) document.getElementById("toggle-2fa-button").textContent = "Disable 2FA";
            console.log(userData.data.two_factor_enabled);
            await this.attachEvents();
        }
        catch (error) {
            console.error("Error in mount():", error);
        }

    }

        async uploadAvatar(url, formData){
        try {
            let headers = {
            };
            if(this.getAccessToken()){
                headers['Authorization'] = `Bearer ${this.getAccessToken()}`;
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: formData,
            });
            const responseData = await response.json();
            if (!response.ok) {
                console.error("Error in uploadAvatar():", url)
                return { success: false, error: responseData};
            }
            return { success: true, data: responseData};
        }
        catch (error) {
            console.error("Network Error at ", url);
            return { success: false, error: { message: "Network error"}};
        }
    }
        
}