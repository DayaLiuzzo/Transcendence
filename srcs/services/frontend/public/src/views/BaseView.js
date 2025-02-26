// tester si remplacer localhost:4430 par '' fonctionne au sein des fetch;

import { cleanUpThree } from "../three/utils.js";


export default class BaseView{
    constructor(router, params = {}){
        this.router = router
        this.params = params;
        this.API_URL_AVATAR = 'https://localhost:4430/api/avatar/';
        this.API_URL_USERS = 'https://localhost:4430/api/users/';
        this.API_URL_TEST = 'https://localhost:4430/api/users/test/';
        this.API_URL = 'https://localhost:4430/api/auth/';
        this.API_URL_SIGNUP = 'https://localhost:4430/api/auth/signup/';
        this.API_URL_ROOMS = 'https://localhost:4430/api/rooms/';
        this.API_URL_LOGIN = 'https://localhost:4430/api/auth/token/';
        this.API_URL_GAME = 'https://localhost:4430/api/game/';
        this.API_URL_TOURNAMENT = 'https://localhost:4430/api/tournament/';

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
            await this.attachEvents();
        }
        catch (error) {
            console.error("Error in mount():", error);
        }
    }

    showError(errors) {
        const errorContainer = this.getErrorContainer();
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

    getErrorContainer() {
        // let errorContainer = document.getElementById("<your_error_container_name>");

        // if (!errorContainer) {
        //     // Create the error container if it doesn't exist
        //     errorContainer = document.createElement("div");
        //     errorContainer.id = "<your_error_container_name>";  // Set a unique ID
        //     errorContainer.classList.add("error-container");  // Optional: Add a class for styling
        //     document.getElementById("<your_form_name>").insertBefore(errorContainer, document.getElementById("<your_form_name>").firstChild); // Insert at the top of the form
        // }

        // return errorContainer;
    }

    async navigateTo(path){
        this.router.navigateTo(path);
    }

    getAccessToken(){

        return this.router.getAccessToken();
    }
    getRefreshToken(){

        return this.router.getRefreshToken();
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
            this.showError(avatarResponse.error);
            return;
        }
        else{
            console.log(avatarResponse.data.avatar_url);
            return avatarResponse.data.avatar_url;
        }
    }

    async updateNavbar() {
        const navbar = document.getElementById("navbar");
    
        if (navbar) {
            navbar.innerHTML = "";
            if (this.isAuthenticated()) {
                navbar.innerHTML += `
                <a href="/home">Home</a>
                <a href="/play-menu">Game</a>
                <a href="/profile">Profile</a>
                <a href="/logout">Logout</a>
                `;

                const avatarUrl =  await this.displayAvatar();
                if (avatarUrl) {
                    console.log("Lol");
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
                `;
            }
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

    async attachEvents(){
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
            friends: (val) => `friends: ${val}`,
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
