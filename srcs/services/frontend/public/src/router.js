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

import EditProfile from "./views/EditProfile.js";
import Profile from "./views/Profile.js";

const routes = [
    { path: '/', view: Home},
    { path: '/home', view: Home},
    { path: '/log-in', view: LogIn, requiresGuest: true },
    { path: '/sign-up', view: SignUp, requiresGuest:true },
    // { path: '/game', view: Game, css: "styles/game.css" },
    { path: '/profile', view: Profile, css: "styles/profile.css", requiresAuth: true },
    { path: '/play-menu', view: PlayMenu, css: "styles/core.css"},
    { path: '/play-local', view: PlayLocal, css: "styles/core.css"},
    { path: '/play-remote', view: PlayRemote, css: "styles/core.css"},
    { path: '/play-tournament', view: PlayTournament, css: "styles/core.css"},
    { path: '/play-with-friends', view: PlayWithFriends, css: "styles/core.css"},
    { path: '/edit-profile', view: EditProfile, css: "styles/edit-profile.css", requiresAuth: true },
];


class Router{
    constructor(routes){
        this.routes = routes;
        this.currentView = null;
        this.init();
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
        return JSON.parse(sessionStorage.getItem("userSession"));
    }

    isAuthenticated() {
       const userSession = this.getUserSession();
       if(userSession){
            return true;
       }
       return false;
    }



    // updateBodyClass(path) {
    //     const className = path === "/" ? "home" : path.replace("/", "");
    //     document.body.className = className;
    // }

    // updateStylesheet(path) {
    //     const route = this.getRoute(path);
    //     const cssFile = route ? route.css : "styles/core.css";

    //     let stylesheet = document.getElementById("dynamic-style");
    //     if (!stylesheet) {
    //         stylesheet = document.createElement("link");
    //         stylesheet.rel = "stylesheet";
    //         stylesheet.id = "dynamic-style";
    //         document.head.appendChild(stylesheet);
    //     }
    //     stylesheet.href = cssFile;
    // }

    async loadView(path){
        const route = this.getRoute(path);
        const ViewClass = route ? route.view : NotFound;
        if (!route) {
            console.warn(`Route for ${path} not found! Showing NotFound view.`);
        }
        if(this.currentView){
            this.currentView.unmount();
        }
        this.currentView = new ViewClass(this);
        document.getElementById("app").innerHTML = this.currentView.render();
        await this.currentView.updateNavbar();
        await this.currentView.mount();
        this.currentView.attachEvents();

        // this.updateBodyClass(path);
        // this.updateStylesheet(path);
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
    }
}


window.addEventListener("DOMContentLoaded", () => {
    const router = new Router(routes);
    router.initialLoad(window.location.pathname);
});
