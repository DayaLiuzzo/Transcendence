import BaseView from './BaseView.js';


export default class LogIn extends BaseView{
    constructor(router, params){
        super(router, params);
        this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
    }

    
    getFormData(){
        return {
            username: document.getElementById("login-username").value,
            password: document.getElementById("login-password").value,
        };
    }
    
    getErrorContainer() {
        let errorContainer = document.getElementById("login-error-container");
        
        if (!errorContainer) {
            errorContainer = document.createElement("div");
            errorContainer.id = "login-error-container";  // Set a unique ID
            errorContainer.classList.add("error-container");  // Optional: Add a class for styling
            document.getElementById("login-form").insertBefore(errorContainer, document.getElementById("login-form").firstChild); // Insert at the top of the form
        }
        
        return errorContainer;
    }
    
    handleLoginSubmit(event){
        event.preventDefault();
        const formData = this.getFormData();
        this.login(formData);
    }


    validateInputs(formData){
        if (!formData.username || formData.username.length < 3) return "Username must be at least 3 characters long.";
        if (formData.username.length > 128) return "Username must be at most 128 characters long.";
        if (!formData.password || formData.password.length < 6) return "Password must be at least 6 characters long.";

        return null;
    }

    async login(formData) {
        const errorMessage = this.validateInputs(formData);
        if (errorMessage) return this.showError(errorMessage)
        const loginResponse = await this.sendPostRequest(this.API_URL_LOGIN, formData);
        if (!loginResponse.success && loginResponse.error.error === "OTP is required."){
            return await this.handleOtp(formData);
        } 
        else if (!loginResponse.success){
            return this.showError(loginResponse.error.error);
        }
        const userSession = {
            username: formData.username,
            access_token: loginResponse.data.access_token,
            refresh_token: loginResponse.data.refresh_token
        };
        sessionStorage.setItem("userSession", JSON.stringify(userSession));
        this.navigateTo("/home");
    }
    
    async handleOtp(formData){
        const otpPopup = document.createElement("div");
        otpPopup.id = "otp-popup";
        otpPopup.innerHTML = `
            <div class="popup-content">
                <h3>Enter OTP</h3>
                <input type="text" id="otp-input" placeholder="Enter OTP" required />
                <button id="verify-otp">Verify</button>
                <button id="close-otp">Cancel</button>
                <p id="otp-error" style="color: red; display: none;"></p>
            </div>
        `;
        otpPopup.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: white; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
            z-index: 1000;
        `;
        document.body.appendChild(otpPopup); // Add popup to the DOM

        const verifyOtpBtn = document.getElementById("verify-otp");
        const closeOtpBtn = document.getElementById("close-otp");
        const otpInput = document.getElementById("otp-input");
        const otpError = document.getElementById("otp-error");

        verifyOtpBtn.addEventListener("click", async () => {
            const otp = otpInput.value;
            formData.otp = otp;
            const response = await this.sendPostRequest(this.API_URL_LOGIN, formData);
            if (response.success){
                const userSession = {
                    username: formData.username,
                    access_token: response.data.access_token,
                    refresh_token: response.data.refresh_token
                };
                sessionStorage.setItem("userSession", JSON.stringify(userSession));
                otpPopup.remove();
                this.navigateTo("/home");
            } else {
                otpError.textContent = "Invalid OTP, try again.";
                document.getElementById("otp-error").style.display = "block";
            }
        });
        closeOtpBtn.addEventListener("click", () => {
            otpPopup.remove();
        })
        
    }

    render(){
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

    unmount(){
        console.log('unmounting login');
        document.getElementById("login-form")?.removeEventListener("submit", this.handleLoginSubmit);
    
    }

    attachEvents(){
        console.log('Events attached (LogIn)');
        document.getElementById("login-form")?.addEventListener("submit", this.handleLoginSubmit);
    }
}
