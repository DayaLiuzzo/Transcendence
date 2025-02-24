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
    { path: '/profile', view: Profile, requiresAuth: true },
    { path: '/play-menu', view: PlayMenu},
    { path: '/play-local', view: PlayLocal},
    { path: '/play-remote', view: PlayRemote},
    { path: '/play-tournament', view: PlayTournament},
    { path: '/play-with-friends', view: PlayWithFriends}


];


class Router{
    constructor(routes){
        this.routes = routes;
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
        history.pushState({}, "", path);
        const view = new ViewClass(this);
        await view.mount();

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
        await this.loadView(path);
    }

    init() {
        // Handle browser back/forward
        // window.addEventListener("popstate", async () => {
        //     console.log("Popstate");
        //     const path = window.location.pathname;
        //     const route = this.getRoute(path);
        //     const isLoggedIn = this.isAuthenticated();

        //     // Check if the user is trying to access a protected route without being logged in
        //     if (route && route.requiresAuth && !isLoggedIn) {
        //         history.replaceState({}, "", "/log-in");
        //         await this.loadView("/log-in");
        //     }
        //     else if (route && route.requiresGuest && isLoggedIn) {
        //         history.replaceState({}, "", "/home");
        //         await this.loadView("/home");
        //     }
        //     else {
        //         await this.loadView(path);  // Here, history pushState should already be handled inside loadView
        //     }
        // });

        // Handle all link clicks (Global Event Delegation)
        document.body.addEventListener("click", (event) => {
            if (event.target.matches("a")) {
                event.preventDefault();
                this.navigateTo(event.target.getAttribute("href"));
            }
        });
    }
}

// // Handle initial page load
window.addEventListener("DOMContentLoaded", () => {
    const router = new Router(routes);
    router.initialLoad(window.location.pathname);
});
