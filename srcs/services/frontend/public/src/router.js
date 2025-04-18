import Home from "./views/Home.js";
import LogIn from "./views/LogIn.js";
import NotFound from "./views/NotFound.js";
import SignUp from "./views/SignUp.js";
import Game from "./views/Game.js";
import PlayMenu from "./views/PlayMenu.js";
import PlayLocal from "./views/PlayLocal.js";
import PlayRemote from "./views/PlayRemote.js";
import PlayRemoteTournament from "./views/PlayRemoteTournament.js";
import PlayTournament from "./views/PlayTournament.js";
import PlayTournamentCreate from "./views/PlayTournamentCreate.js";
import PlayTournamentList from "./views/PlayTournamentList.js";
import PlayTournamentJoin from "./views/PlayTournamentJoin.js";
import PlayTournamentMine from "./views/PlayTournamentMine.js";
import PlayWithFriends from "./views/PlayWithFriends.js";

import { cleanUpThree } from "./three/utils.js";
import EditProfile from "./views/EditProfile.js";
import Profile from "./views/Profile.js";

const routes = [
    { path: '/', view: Home},
    { path: '/home', view: Home},
    { path: '/log-in', view: LogIn, requiresGuest: true },
    { path: '/sign-up', view: SignUp, requiresGuest:true },
    { path: '/profile', view: Profile, css: "styles/profile.css", requiresAuth: true },
    { path: '/play-menu', view: PlayMenu, css: "styles/core.css", requiresAuth: true},
    { path: '/play-local', view: PlayLocal, css: "styles/core.css", requiresAuth: false},
    { path: '/play-remote', view: PlayRemote, css: "styles/core.css", requiresAuth: true},
    { path: '/play-tournament', view: PlayTournament, css: "styles/core.css", requiresAuth: true},
    { path: '/create-tournament', view: PlayTournamentCreate, css: "styles/core.css", requiresAuth: true},
    { path: '/list-tournament', view: PlayTournamentList, css: "styles/core.css", requiresAuth: true},
    { path: '/join-tournament', view: PlayTournamentJoin, css: "styles/core.css", requiresAuth: true},
    { path: '/my-tournament', view: PlayTournamentMine, css: "styles/core.css", requiresAuth: true},
    { path: '/play-with-friends', view: PlayWithFriends, css: "styles/core.css", requiresAuth: true},
    { path: '/play-remote-tournament', view: PlayRemoteTournament, css: "styles/core.css", requiresAuth: true},
    { path: '/edit-profile', view: EditProfile, css: "styles/edit-profile.css", requiresAuth: true }
];

class Router{
    constructor(routes){
        this.routes = routes;
        this.currentView = null;
        this.init();
        this.API_URL_USERS = '/api/users/';
        this.RerenderFriendsInterval = null;
        this.RerenderTournamentInterval = null;
        this.RerenderTournamentIntervalPlay = null;
    }

    getRoutes(){
        return this.routes;
    }

    getRoute(path){
        return this.routes.find(route => route.path === path);
    }

    getUsername(){
        const userSession = this.getUserSession();
        if(userSession){
            return userSession.username;
        }
        return null;
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

    async updateLastSeen(isOnline) {
        const username = this.getUsername();
        const response = await this.sendPatchRequest(this.API_URL_USERS + 'update_last_seen/' + username + '/', {isOnline});
        if (!response.success){
            this.stopUpdatingLastSeen();
            return;
        }

    }

    startUpdatingLastSeen() {
        // console.log("⏳ Last seen tracking started...");
        const username = this.getUsername();
        this.sendPatchRequest(this.API_URL_USERS + 'update_last_seen/' + username + '/', {isOnline: true});
    }


    stopUpdatingLastSeen() {
        // console.log("Stop tracking last seen");
        const username = this.getUsername();
        this.sendPatchRequest(this.API_URL_USERS + 'update_last_seen/' + username + '/', {isOnline: false});
        this.customClearInterval(this.RerenderFriendsInterval);
    }


    getAccessToken(){
        const userSession = this.getUserSession();
        if(userSession){
            return userSession.access_token;
        }
        return null;
    }

    getRefreshToken(){
        const userSession = this.getUserSession();
        if(userSession){
            return userSession.refresh_token;
        }
        return null;
    }

    getUserSession(){
        return JSON.parse(localStorage.getItem("userSession"));
    }

    isAuthenticated() {
       const userSession = this.getUserSession();
       if(userSession){
            return true;
       }
       return false;
    }

    customClearInterval(interval){
        if(interval){
            clearInterval(interval);
            interval = null;
            // console.log("stopped interval")
        }
    }

    stopTournamentInforInterval(){
        this.customClearInterval(this.RerenderTournamentInterval);
    }

    async loadView(path){
        // console.log("ENTERING LOAD VIEW :", path);
        this.customClearInterval(this.RerenderFriendsInterval);
        const route = this.getRoute(path);
        const ViewClass = route ? route.view : NotFound;
        if (!route) {
            console.warn(`Route for ${path} not found! Showing NotFound view.`);
        }
        if(this.currentView){
            cleanUpThree();
            // console.log("ENTERING LOAD VIEW :", path);
            this.currentView.unmount();
        }
        document.getElementById('app').innerText = "";
        this.currentView = new ViewClass(this);

        document.getElementById("app").innerHTML = this.currentView.render();
        await this.currentView.updateNavbar();
        // console.log("MOUNTING IN LOAD VIEW :", path);
        await this.currentView.mount();
        // console.log("ATTACHING EVENTS IN LOAD VIEW:", path);
        this.currentView.attachEvents();
        }

    async navigateTo(path){
        // console.log("ENTERING router Navigate_TO", path)
        const route = this.getRoute(path);
        const isLoggedIn = this.isAuthenticated();
        if (route && route.requiresAuth && !isLoggedIn) {
            await this.loadView("/log-in");
            return;
        }
        if (route && route.requiresGuest && isLoggedIn) {
            await this.loadView("/home");
            return;
        }
        history.pushState({ path }, "", path);
        
        // console.log("Navigate_TO in router", path)
        await this.loadView(path);
    }

    async initialLoad(path){
        const route = this.getRoute(path);
        const isLoggedIn = this.isAuthenticated();
        if (route && route.requiresAuth && !isLoggedIn) {
            await this.loadView("/log-in");
            return;
        }
        if (route && route.requiresGuest && isLoggedIn) {
            await this.loadView("/home");
            return;
        }
        history.replaceState({ path }, "", path);
        await this.loadView(path);
    }

    init() {

        // Handle all link clicks (Global Event Delegation)
        document.body.addEventListener("click", (event) => {
            if (event.target.matches("a")) {
                event.preventDefault();
                this.navigateTo(event.target.getAttribute("href"));
            }
        });


        window.addEventListener("popstate", async (event) => {
            if (event.state && event.state.path) {
                const path = event.state.path;
                const route = this.getRoute(path);

                if (route && route.requiresAuth && !this.isAuthenticated()) {
                    console.warn(`Access denied to ${path}. Redirecting to /log-in.`);
                    history.replaceState({ path: "/log-in" }, "", "/log-in");
                    await this.loadView("/log-in");
                    return;
                }

                if (route && route.requiresGuest && this.isAuthenticated()) {
                    console.warn(`Guests cannot access ${path}. Redirecting to /home.`);
                    history.replaceState({ path: "/home" }, "", "/home");
                    await this.loadView("/home");
                    return;
                }

                if (!route) {
                    console.warn(`Route for ${path} not found! Redirecting to /home.`);
                    history.replaceState({ path: "/home" }, "", "/home");
                    await this.loadView("/home");
                    return;
                }

                await this.loadView(path);
            }
        });
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const router = new Router(routes);
    router.initialLoad(window.location.pathname);
});
