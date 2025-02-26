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

    async render(){
        return `<div>Base View</div>`;
    }

    async mount(){
        try {
            cleanUpThree();
            this.app.innerHTML = await this.render();
            await this.updateNavbar();
            await this.attachEvents();
        }
        catch (error) {
            console.error("Error in mount():", error);
        }
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
    
        // If navbar exists, update it
        if (navbar) {
            // Clear all existing navbar content first (to avoid duplication)
            navbar.innerHTML = "";
    
            // If the user is authenticated
            if (this.isAuthenticated()) {
                // Append the main navbar links
                navbar.innerHTML += `
                <a href="/home">Home</a>
                <a href="/play-menu">Game</a>
                <a href="/profile">Profile</a>
                <a href="/logout">Logout</a>
                `;
    
                // If the avatarUrl is provided, append the avatar
                const avatarUrl =  await this.displayAvatar();
                if (avatarUrl) {
                    console.log("Lol");
                    const avatarImg = document.createElement("img");
                    avatarImg.src = avatarUrl;
                    avatarImg.alt = "User Avatar";
                    avatarImg.className = "navbar-avatar";
    
                    // Append the avatar image after the links (or at the end of the navbar)
                    navbar.appendChild(avatarImg);
                }
            } else {
                // If the user is not authenticated, show other links
                navbar.innerHTML = `
                <a href="/home">Home</a>
                <a href="/log-in">Log in</a>
                <a href="/sign-up">Sign up</a>
                <a href="/play-menu">Game</a>
                `;
            }
        }
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
