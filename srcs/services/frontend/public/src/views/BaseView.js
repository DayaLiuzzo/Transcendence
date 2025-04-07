// tester si remplacer localhost:4430 par '' fonctionne au sein des fetch;

import { cleanUpThree } from "../three/utils.js";


export default class BaseView{
    constructor(router, params = {}){
        this.router = router
        this.params = params;
        this.API_URL_AVATAR = '/api/avatar/';
        this.API_URL_USERS = '/api/users/';
        this.API_URL_TEST = '/api/users/test/';
        this.API_URL = '/api/auth/';
        this.API_URL_SIGNUP = '/api/auth/signup/';
        this.API_URL_ROOMS = '/api/rooms/';
        this.API_URL_LOGIN = '/api/auth/token/';
        this.API_URL_GAME = '/api/game/';
        this.API_URL_TOURNAMENT = '/api/tournament/';

        this.app = document.getElementById('app');
        if (!this.app) {
            // console.error("Error: Element with id 'app' not found in document");
        }
    }
    //RENDER THE VIEW WITH THE STATIC HTML
    render(){
        return `<div>Base View</div>`;
    }

    //UPDATE THE HTML CONTENT WITH DYNAMIC DATA AND THEN ATTACH EVENTS
    async mount(){
        // console.log("BaseView mounted");
    }

    async isOnline(username){
        const response = await this.sendGetRequest(this.API_URL_USERS + "/status/" + username + "/");
        if (!response.success) {
            this.customAlert(response.error);
            return;
        }
        return response.data.online;

    }

    startUpdatingLastSeen() {
       this.router.startUpdatingLastSeen();
    }

    stopUpdatingLastSeen() {
        this.router.stopUpdatingLastSeen();
    }

    showError(errors, formId) {
        const errorContainer = this.getErrorContainer(formId);
        errorContainer.innerHTML = '';
        if (typeof errors === 'string') {
            const errorMessage = document.createElement("p");
            errorMessage.textContent = errors;
            errorContainer.appendChild(errorMessage);
        } else if (typeof errors === 'object') {
            for (const field in errors) {
                if (errors.hasOwnProperty(field)) {
                    const errorMessages = Array.isArray(errors[field]) ? errors[field] : [errors[field]];
                    errorMessages.forEach((message) => {
                        const errorMessage = document.createElement("p");
                        errorMessage.textContent = `${field.charAt(0).toUpperCase() + field.slice(1)}: ${message}`;
                        errorContainer.appendChild(errorMessage);
                    });
                }
            }
        }
        errorContainer.style.display = "block";

    }

    showAlert(message){
        // console.log(message);
        const alertOverlay = document.createElement("div");
        alertOverlay.id = "dynamic-alert";
        alertOverlay.style.position = "fixed";
        alertOverlay.style.top = "0";
        alertOverlay.style.left = "0";
        alertOverlay.style.width = "100%";
        alertOverlay.style.height = "100%";
        alertOverlay.style.background = "rgba(0, 0, 0, 0.6)";
        alertOverlay.style.display = "flex";
        alertOverlay.style.alignItems = "center";
        alertOverlay.style.justifyContent = "center";
        alertOverlay.style.zIndex = "1000";

        const alertBox = document.createElement("div");
        alertBox.style.background = "white";
        alertBox.style.padding = "20px";
        alertBox.style.borderRadius = "10px";
        alertBox.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
        alertBox.style.textAlign = "center";
        alertBox.style.width = "300px";
        alertBox.style.fontFamily = "Arial, sans-serif";

        const alertMessage = document.createElement("p");
        alertMessage.textContent = message;
        alertMessage.style.marginBottom = "15px";

        const closeButton = document.createElement("button");
        closeButton.textContent = "OK";
        closeButton.style.background = "#101010";
        closeButton.style.color = "white";
        closeButton.style.border = "none";
        closeButton.style.padding = "10px 20px";
        closeButton.style.borderRadius = "5px";
        closeButton.style.cursor = "pointer";
        closeButton.style.fontSize = "16px";

        closeButton.onmouseover = () => (closeButton.style.background = "#808080");
        closeButton.onmouseleave = () => (closeButton.style.background = "#101010");

        closeButton.onclick = () => alertOverlay.remove();

        alertBox.appendChild(alertMessage);
        alertBox.appendChild(closeButton);
        alertOverlay.appendChild(alertBox);
        document.body.appendChild(alertOverlay);

    }
    
    customAlert(message){
        let displayMessage = ""; 

        if (typeof message === "string") {
            displayMessage = message;
        } else if (typeof message === "object" && message !== null) {
            // Handle object with error arrays
            const firstKey = Object.keys(message)[0]; 
            if (Array.isArray(message[firstKey])) {
                displayMessage = message[firstKey][0]; 
            } else {
                displayMessage = JSON.stringify(message); 
            }
        } else if (Array.isArray(message)) {
            displayMessage = message.join("\n"); 
        } else if (typeof message === "number" || typeof message === "boolean") {
            displayMessage = message.toString();
        } else {
            displayMessage = "An unknown error occurred.";
        }

        this.showAlert(displayMessage);
    }

    getErrorContainer(formId) {
        let errorContainer = document.getElementById(formId+ "-error-container");

        if (!errorContainer) {
            errorContainer = document.createElement("div");
            errorContainer.id = formId+ "-error-container";
            errorContainer.classList.add("error-container");
            // console.log(formId);
            
            document.getElementById(formId).insertBefore(errorContainer, document.getElementById(formId).firstChild);
        }

        return errorContainer;
    }

    async navigateTo(path){
        this.router.navigateTo(path);
    }

    getRefreshToken(){
        return this.router.getRefreshToken();
    }

    getAccessToken(){

        return this.router.getAccessToken();
    }

    getUserSession(){

        return this.router.getUserSession();
    }

    getUsername(){
        return this.router.getUsername();
    }

    isAuthenticated() {

        return this.router.isAuthenticated();
    }

    async displayAvatar(){
        const avatarResponse = await this.sendGetRequest(this.API_URL_USERS + this.getUsername() + "/avatar/");
        if (!avatarResponse.success) {
            this.customAlert(avatarResponse.error);
            return;
        }
        else{
            return avatarResponse.data.avatar_url;
        }
    }

    async refreshToken(){
        const refresh_token = this.getRefreshToken();
        const response = await this.sendPostRequest(this.API_URL+ 'refresh/', { refresh: refresh_token });
        if (!response.success){
            this.stopUpdatingLastSeen();
            return false;
        }
        let userSession = this.getUserSession();
        userSession.access_token = response.data.access;
        userSession.refresh_token = response.data.refresh;
        localStorage.setItem("userSession", JSON.stringify(userSession));
        return true;
    }

    async refreshToken(){
        const refresh_token = this.getRefreshToken();
        const response = await this.sendPostRequest(this.API_URL+ 'refresh/', { refresh: refresh_token });
        if (!response.success){
            this.stopUpdatingLastSeen();
            return false;
        }
        let userSession = this.getUserSession();
        userSession.access_token = response.data.access;
        userSession.refresh_token = response.data.refresh;
        localStorage.setItem("userSession", JSON.stringify(userSession));
        return true;
    }

    toggleMenu() {
        const closeIcon= document.querySelector(".closeIcon");
        const menuIcon = document.querySelector(".menuIcon");
        const navbar = document.getElementById("navbar");

        if (navbar.classList.contains("active")) {
            navbar.classList.remove("active");
            closeIcon.style.display = "none";
            menuIcon.style.display = "block";
        } else {
            navbar.classList.add("active");
            closeIcon.style.display = "block";
            menuIcon.style.display = "none";
        }
    }

    closeMenu() {
        const navbar = document.getElementById("navbar");
        const closeIcon= document.querySelector(".closeIcon");
        const menuIcon = document.querySelector(".menuIcon");
        closeIcon.style.display = "none";
        menuIcon.style.display = "block";
        navbar.classList.remove("active");
    }

    async updateNavbar() {
        // console.log("updating navbar");
        const navbar = document.getElementById("navbar");

        if (navbar) {
            navbar.innerHTML = "";
            if (this.isAuthenticated()) {
                const avatarUrl = await this.displayAvatar();
                // console.log(avatarUrl)
                if (avatarUrl) {
                    const avatarImg = document.createElement("img");
                    avatarImg.src = avatarUrl;
                    console.log("avatar IMAGE SOURCE : ", avatarImg.src);
                    avatarImg.alt = "User Avatar";
                    avatarImg.className = "navbar-avatar";

                    const welcomeText = document.createElement("span");
                    welcomeText.textContent = "Welcome " + this.getUsername();
                    welcomeText.className = "welcome-text";

                    const flexContainer = document.createElement("div");
                    flexContainer.className = "navbar-flex";

                    const bar = document.createElement("div");
                    bar.className = "navbar-bar"

                    flexContainer.appendChild(avatarImg);
                    flexContainer.appendChild(welcomeText);

                    navbar.appendChild(flexContainer);
                    navbar.appendChild(bar);
                }

                navbar.innerHTML += `
                <a href="/home">Home</a>
                <a href="/play-menu">Play</a>
                <a href="/profile">Profile</a>
                `;

            } else {
                navbar.innerHTML = `
                <a href="/home">Home</a>
                <a href="/log-in">Log in</a>
                <a href="/sign-up">Sign up</a>
                <a href="/play-menu">Game</a>
                `;
            }
            const menuButton = document.getElementById("button-nav");
            const closeIcon = document.querySelector(".closeIcon");
            const menuIcon = document.querySelector(".menuIcon");
            const menuLinks = navbar.querySelectorAll("a");
            menuIcon.style.display = "block";
            closeIcon.style.display = "none";
            menuButton.addEventListener("click", this.toggleMenu);
            menuLinks.forEach(link => {
                link.onclick = this.closeMenu;
            });
        }
    }

    unmount(){
        // console.log("BaseView unmounted");
    }

    async sendGetRequest(url){
        try {
            let headers = {
                'Content-Type': 'application/json',
            };
            if(this.getAccessToken()){
                headers['Authorization'] = `Bearer ${this.getAccessToken()}`;
            }

            let response = await fetch(url, {
                method: 'GET',
                headers: headers,
            });
            if (response.status === 403) {
                const refreshed = await this.refreshToken();
                if (!refreshed) {
                    this.logout();
                    return;
                }
                else{
                    headers['Authorization'] = `Bearer ${this.getAccessToken()}`;
                    response = await fetch(url, {
                        method: 'GET',
                        headers: headers,
                    });
                }
            }
            const responseData = await response.json();
            if (!response.ok) {
                // console.error("Error in sendGetRequest():", url)
                return { success: false, error: responseData};
            }
            return { success: true, data: responseData};
        }
        catch (error) {
            // console.error("Network Error at ", url);
            return { success: false, error: { message: "Network error"}};
        }
    }


    async sendPatchRequest(url, formData){
        try {
            let headers = {
                'Content-Type': 'application/json',
            };
            if(this.getAccessToken()){
                headers['Authorization'] = `Bearer ${this.getAccessToken()}`;
            }

            let response = await fetch(url, {
                method: 'PATCH',
                headers: headers,
                body: JSON.stringify(formData),
            });
            if (response.status === 403) {
                const refreshed = await this.refreshToken();
                if (!refreshed) {
                    this.logout();
                    return;
                }
                else{
                    headers['Authorization'] = `Bearer ${this.getAccessToken()}`;
                    response = await fetch(url, {
                        method: 'PATCH',
                        headers: headers,
                        body: JSON.stringify(formData),
                    });
                }
            }
            const responseData = await response.json();
            if (!response.ok) {
                // console.error("Error in sendPatchRequest():", url)
                return { success: false, error: responseData};
            }
            return { success: true, data: responseData};
        }
        catch (error) {
            // console.error("Network Error at ", url);
            return { success: false, error: { message: "Network error"}};
        }
    }


    async sendDeleteRequest(url, formData){
        try {
            let headers = {
                'Content-Type': 'application/json',
            };
            if(this.getAccessToken()){
                headers['Authorization'] = `Bearer ${this.getAccessToken()}`;
            }

            let response = await fetch(url, {
                method: 'DELETE',
                headers: headers,
                body: JSON.stringify(formData),
            });
            if (response.status === 403) {
                const refreshed = await this.refreshToken();
                if (!refreshed) {
                    this.logout();
                    return;
                }
                else{
                    headers['Authorization'] = `Bearer ${this.getAccessToken()}`;
                    response = await fetch(url, {
                        method: 'DELETE',
                        headers: headers,
                        body: JSON.stringify(formData),
                    });
                }
            }
            const responseData = await response.json();
            if (!response.ok) {
                // console.error("Error in sendDeleteRequest():", url)
                return { success: false, error: responseData};
            }
            return { success: true, data: responseData};
        }
        catch (error) {
            // console.error("Network Error at ", url);
            return { success: false, error: { message: "Network error"}};
        }
    }

    async sendPostRequest(url, formData){
        try {
            let headers = {
                'Content-Type': 'application/json',
            };
            if(this.getAccessToken()){
                headers['Authorization'] = `Bearer ${this.getAccessToken()}`;
            }

            let response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(formData),
            });
            if (response.status === 403) {
                const refreshed = await this.refreshToken();
                if (!refreshed) {
                    this.logout();
                    return;
                }
                else{
                    headers['Authorization'] = `Bearer ${this.getAccessToken()}`;
                    response = await fetch(url, {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify(formData),
                    });
                }
            }
            const responseData = await response.json();
            if (!response.ok) {
                // console.error("Error in sendPostRequest():", url)
                return { success: false, error: responseData};
            }
            return { success: true, data: responseData};
        }
        catch (error) {
            // console.error("Network Error at ", url);
            return { success: false, error: { message: "Network error"}};
        }
    }

    attachEvents(){
        // console.log('Events attached');
    }

    updateFieldContent(fieldId, content){
        const field = document.getElementById(fieldId);
        if (field) {
            field.textContent = content;
        }
    }

    formatField(type, value){
        if (!value) return "No information available.";

        const formats ={
            username: (val) => `Username: ${val}`,
            biography: (val) => `Biography: ${val}`,
            email: (val) => `Email: ${val}`,
        };

        return formats[type] ? formats[type](value) : value;
    }

    logout() {
        const refresh_token = this.getRefreshToken();
        if (refresh_token) {
            this.sendPostRequest(this.API_URL + 'logout/', {refresh: refresh_token});
            this.stopUpdatingLastSeen();
        }
        localStorage.removeItem("userSession");
        this.navigateTo("/log-in");
    }


}
