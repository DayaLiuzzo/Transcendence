import BaseView from './BaseView.js';

export default class EditProfile extends BaseView {
    constructor(router, params) {
        super(router, params);
    }


    containsSpecialCharacter(password) {
        const regex = /[@#$%^&*!]/;
        return regex.test(password);
    }


    validateInputs(formData) {
        if (!formData.new_password || !formData.new_password2 || formData.new_password.length < 6) return "Password must be at least 6 characters long.";
        if (formData.new_password !== formData.new_password2) return "Passwords do not match.";
        if (!this.containsSpecialCharacter(formData.new_password)) return "Password must contain special characters.";
        return null;
    }

    validateUsername(formData) {
        if (!formData.username) return "Username cannot be empty.";
        if (formData.username.length < 3) return "Username must be at least 3 characters long.";
        if (formData.username === this.getUsername()) return "Username cannot be the same as the current one.";
        if (this.containsSpecialCharacter(formData.username)) return "Username can't contain special characters.";
        if (formData.username > 20) return "Username must be less than 20 characters long.";
        return null;
    }

    async changePassword(formData) {
        const error = this.validateInputs(formData);
        if (error) {
            this.showError(error, "change-password-form");
            return;
        }
        const username = this.getUsername();
        const response = await this.sendPatchRequest(this.API_URL + "change-password/" + username + "/", formData);
        if (response.error) {
            this.showError(response.error, "change-password-form");
            return;
        }
        alert("Password changed successfully");
        this.navigateTo("/profile");
    }

    async changeUsername(formData) {
        const error = this.validateUsername(formData);
        if (error) {
            this.showError(error, "change-username-form");
            return;
        }
        const username = this.getUsername();
        const body = {
            old_username: username,
            username: username,
            new_username: formData.username,
        };
        const response = await this.sendPatchRequest(this.API_URL + "update/" + username + "/", body);
        if (!response.success) {
            this.showError(response.error, "change-username-form");
            return;
        }
        alert(response.data.message);
        let userSession = JSON.parse(localStorage.getItem("userSession"));
        userSession.username = formData.username;
        userSession.access_token = response.data.access;
        userSession.refresh_token = response.data.refresh;
        localStorage.setItem("userSession", JSON.stringify(userSession));
        if (userSession.two_factor_enabled) {
            alert(response.data.otp);
            this.navigateTo("/profile");
        } else {
            this.navigateTo("/profile");
        }
    }

    getPasswordFormData() {
        return {
            password: document.getElementById("EditProfile-password").value,
            new_password: document.getElementById("EditProfile-new_password").value,
            new_password2: document.getElementById("EditProfile-new_password2").value,
        };
    }

    getUsernameFormData() {
        return {
            username: document.getElementById("EditProfile-username").value,
        };
    }

    render() {
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
                    <h2>Edit Profile</h2>
                    <h3>Change Password</h3>
                    <form id="change-password-form">
                        <input type="password" id="EditProfile-password" placeholder="Old Password" required>
                        <input type="password" id="EditProfile-new_password" placeholder="New Password" required>
                        <input type="password" id="EditProfile-new_password2" placeholder="Confirm New Password" required>
                        <button type="submit">Change Password</button>
                    </form>
                    <h3>Change Username</h3>
                    <div id="username-field"></div>
                    <form id="change-username-form">
                        <input type="text" id="EditProfile-username" placeholder="Username" required>
                        <button type="submit">Change Username</button>
                    </form>
                    <button id="toggle-2fa-button">Enable 2FA</button>
                    <input type="file" id="avatar-upload" accept="image/*" />
                    <button id="upload-avatar-btn">Upload Avatar</button>
                </div>
            </div>
        `;
    }

    attachEvents() {
        console.log('Events attached (EditProfile)');
        document.getElementById("change-password-form").addEventListener("submit", this.handleSubmitPassword.bind(this));
        document.getElementById("change-username-form").addEventListener("submit", this.handleSubmitUsername.bind(this));
        document.getElementById("toggle-2fa-button").addEventListener("click", this.handleToggle2FA.bind(this));
        document.getElementById("upload-avatar-btn").addEventListener("click", this.handleUploadAvatar.bind(this));
    }

    async handleSubmitPassword(event) {
        event.preventDefault();
        const formData = this.getPasswordFormData();
        this.changePassword(formData);
    }

    async handleSubmitUsername(event) {
        event.preventDefault();
        const formData = this.getUsernameFormData();
        this.changeUsername(formData);
    }

    async handleToggle2FA() {
        const button = document.getElementById("toggle-2fa-button");
        const body = {
            enable: button.textContent === "Enable 2FA"
        };

        const response = await this.sendPostRequest(this.API_URL + "2fa/setup/", body);
        if (response.error) {
            this.showError(response.error, "toggle-2fa-button");
            return;
        }

        let userSession = JSON.parse(localStorage.getItem("userSession"));
        userSession.two_factor_enabled = body.enable;
        localStorage.setItem("userSession", JSON.stringify(userSession));

        alert(body.enable ? `Save the code: ${response.data.otp_secret}` : response.data.message);
        button.textContent = body.enable ? "Disable 2FA" : "Enable 2FA";
    }

    async handleUploadAvatar() {
        const fileInput = document.getElementById("avatar-upload");
        const file = fileInput.files[0];

        if (!file) {
            this.showError("missing file", "app");
            return;
        }

        const formData = new FormData();
        formData.append("avatar", file);
        const response = await this.uploadAvatar(this.API_URL_AVATAR, formData);

        if (!response.success) {
            this.showError(response.error, "app");
            return;
        }

    }

    async mount() {
        try {
            const username = this.getUsername();
            this.updateFieldContent("username-field", this.formatField("username", username));
            const userData = await this.sendGetRequest(this.API_URL + username + '/');
            if (userData.data.two_factor_enabled) document.getElementById("toggle-2fa-button").textContent = "Disable 2FA";
        } catch (error) {
            console.error("Error in mount():", error);
        }
    }

    async uploadAvatar(url, formData) {
        try {
            let headers = {};
            if (this.getAccessToken()) {
                headers['Authorization'] = `Bearer ${this.getAccessToken()}`;
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: formData,
            });
            const responseData = await response.json();
            if (!response.ok) {
                console.error("Error in uploadAvatar():", url);
                return { success: false, error: responseData };
            }
            return { success: true, data: responseData };
        } catch (error) {
            console.error("Invalid Image", url);
            return { success: false, error: { message: "Bad image (must be under 2mb)" } };
        }
    }
}
