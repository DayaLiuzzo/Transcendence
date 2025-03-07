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
            console.error("Error: Element with id 'app' not found in document");
        }
    }
    //RENDER THE VIEW WITH THE STATIC HTML
    render(){
        return `<div>Base View</div>`;
    }

    //UPDATE THE HTML CONTENT WITH DYNAMIC DATA AND THEN ATTACH EVENTS
    async mount(){
        try {
            cleanUpThree();
        }
        catch (error) {
            console.error("Error in mount():", error);
        }
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

    getErrorContainer(formId) {
        let errorContainer = document.getElementById(formId+ "-error-container");

        if (!errorContainer) {
            errorContainer = document.createElement("div");
            errorContainer.id = formId+ "-error-container";  // Set a unique ID
            errorContainer.classList.add("error-container");  // Optional: Add a class for styling
            document.getElementById(formId).insertBefore(errorContainer, document.getElementById(formId).firstChild); // Insert at the top of the form
        }

        return errorContainer;
    }

    async navigateTo(path){
        this.router.navigateTo(path);
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
            this.showError(avatarResponse.error, "app");
            return;
        }
        else{
            return avatarResponse.data.avatar_url;
        }
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
        const navbar = document.getElementById("navbar");

        if (navbar) {
            navbar.innerHTML = "";
            if (this.isAuthenticated()) {
                navbar.innerHTML += `
                <a href="/home">Home</a>
                <a href="/play-menu">Play</a>
                <a href="/profile">Profile</a>
                <a href="/logout">Logout</a>
                <button id="close-nav">Close</button>
                `;

                const avatarUrl =  await this.displayAvatar();
                if (avatarUrl) {
                    const avatarImg = document.createElement("img");
                    avatarImg.src = avatarUrl;
                    avatarImg.alt = "User Avatar";
                    avatarImg.className = "navbar-avatar";
                    navbar.appendChild(avatarImg);
                }
            } else {
                navbar.innerHTML = `
                <a href="/home">Home</a>
                <a href="/log-in">Log in</a>
                <a href="/sign-up">Sign up</a>
                <a href="/play-menu">Game</a>
                <button id="close-nav">Close</button>
                `;
            }
            const menuButton = document.getElementById("button-nav");
            const closeIcon = document.querySelector(".closeIcon");
            const menuIcon = document.querySelector(".menuIcon");
            const menuLinks = navbar.querySelectorAll("a");
            menuIcon.style.display = "block";
            closeIcon.style.display = "none";
            menuButton.addEventListener("click", this.toggleMenu);
            const closeNav = document.getElementById("close-nav");
            closeNav.onclick = this.closeMenu;
            menuLinks.forEach(link => {
                link.onclick = this.closeMenu;
            });
        }
    }

    unmount(){
        console.log("BaseView unmounted");
    }

    async sendGetRequest(url){
        try {
            let headers = {
                'Content-Type': 'application/json',
            };
            if(this.getAccessToken()){
                headers['Authorization'] = `Bearer ${this.getAccessToken()}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: headers,
            });
            const responseData = await response.json();
            if (!response.ok) {
                console.error("Error in sendGetRequest():", url)
                return { success: false, error: responseData};
            }
            return { success: true, data: responseData};
        }
        catch (error) {
            console.error("Network Error at ", url);
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

            const response = await fetch(url, {
                method: 'PATCH',
                headers: headers,
                body: JSON.stringify(formData),
            });
            const responseData = await response.json();
            if (!response.ok) {
                console.error("Error in sendPatchRequest():", url)
                return { success: false, error: responseData};
            }
            return { success: true, data: responseData};
        }
        catch (error) {
            console.error("Network Error at ", url);
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

            const response = await fetch(url, {
                method: 'DELETE',
                headers: headers,
                body: JSON.stringify(formData),
            });
            const responseData = await response.json();
            if (!response.ok) {
                console.error("Error in sendDeleteRequest():", url)
                return { success: false, error: responseData};
            }
            return { success: true, data: responseData};
        }
        catch (error) {
            console.error("Network Error at ", url);
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

            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(formData),
            });
            const responseData = await response.json();
            if (!response.ok) {
                console.error("Error in sendPostRequest():", url)
                return { success: false, error: responseData};
            }
            return { success: true, data: responseData};
        }
        catch (error) {
            console.error("Network Error at ", url);
            return { success: false, error: { message: "Network error"}};
        }
    }

    attachEvents(){
        console.log('Events attached');
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
            console.log(refresh_token);
            this.sendPostRequest(this.API_URL + 'logout/', {refresh: refresh_token});
            sessionStorage.removeItem("userSession");
            this.navigateTo("/log-in");
        }
        // this.sendPostRequest(this.API_URL + 'logout/', {});
    }


}
