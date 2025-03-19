import Home from "./views/Home.js";
import LogIn from "./views/LogIn.js";
import NotFound from "./views/NotFound.js";
import SignUp from "./views/SignUp.js";
import Game from "./views/Game.js";
import PlayMenu from "./views/PlayMenu.js";
import PlayLocal from "./views/PlayLocal.js";
import PlayRemote from "./views/PlayRemote.js";
import PlayTournament from "./views/PlayTournament.js";
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
    { path: '/play-with-friends', view: PlayWithFriends, css: "styles/core.css", requiresAuth: true},
    { path: '/edit-profile', view: EditProfile, css: "styles/edit-profile.css", requiresAuth: true }
];

class Router{
    constructor(routes){
        this.routes = routes;
        this.currentView = null;
        this.init();
        this.lastSeenInterval = null;
        this.API_URL_USERS = '/api/users/';
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

    async updateLastSeen() {
        const username = this.getUsername();
        const response = await this.sendPatchRequest(this.API_URL_USERS + 'update_last_seen/' + username + '/', {});
        if (!response.success){
            this.stopUpdatingLastSeen();
            return;
        }

    }

    startUpdatingLastSeen() {
        if (!this.lastSeenInterval) {
            this.updateLastSeen();
            this.lastSeenInterval = setInterval(() => this.updateLastSeen(), 30000);
            console.log("⏳ Last seen tracking started...");
        }
    }

    stopUpdatingLastSeen() {
        if (this.lastSeenInterval) {
            clearInterval(this.lastSeenInterval);
            this.lastSeenInterval = null;
            console.log("🛑 Last seen tracking stopped...");
        }
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

    async loadView(path){
        const route = this.getRoute(path);
        const ViewClass = route ? route.view : NotFound;
        if (!route) {
            console.warn(`Route for ${path} not found! Showing NotFound view.`);
        }
        if(this.currentView){
            cleanUpThree();
            this.currentView.unmount();
        }
        this.currentView = new ViewClass(this);

        document.getElementById("app").innerHTML = this.currentView.render();
        await this.currentView.updateNavbar();
        await this.currentView.mount();
        this.currentView.attachEvents();
        }

    async navigateTo(path){
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

        window.addEventListener("storage", (event) => {
            if (event.key === "logout") {
                clearInterval(this.lastSeenInterval);
                this.stopUpdatingLastSeen();
                console.log("🛑 Logged out in another tab: Stopping interval...");
            }
        });
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const router = new Router(routes);
    router.initialLoad(window.location.pathname);
});
