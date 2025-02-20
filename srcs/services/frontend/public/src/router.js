import Home from "./views/Home.js";
import LogIn from "./views/LogIn.js";
import NotFound from "./views/NotFound.js";
import SignUp from "./views/SignUp.js";
import Game from "./views/Game.js";


const routes = [
    { path: '/', view: Home, css: "styles/home.css" },
    { path: '/home', view: Home, css: "styles/home.css" },
    { path: '/log-in', view: LogIn, css: "styles/log-in.css" },
    { path: '/sign-up', view: SignUp, css: "styles/sign-up.css" },
    { path: '/game', view: Game, css: "styles/game.css" },
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

    updateBodyClass(path) {
        const className = path === "/" ? "home" : path.replace("/", "");
        document.body.className = className;
    }

    updateStylesheet(path) {
        const route = this.getRoute(path);
        const cssFile = route ? route.css : "styles/core.css";

        let stylesheet = document.getElementById("dynamic-style");
        if (!stylesheet) {
            stylesheet = document.createElement("link");
            stylesheet.rel = "stylesheet";
            stylesheet.id = "dynamic-style";
            document.head.appendChild(stylesheet);
        }
        stylesheet.href = cssFile;
    }

    async loadView(path){
        const route = this.getRoute(path);
        const ViewClass = route ? route.view : NotFound;
        if (!route) {
            console.warn(`Route for ${path} not found! Showing NotFound view.`);
        }
        const view = new ViewClass(this);
        await view.mount();

        this.updateBodyClass(path);
        this.updateStylesheet(path);
        }

    async navigateTo(path){
        history.pushState({}, "", path);
        await this.loadView(path);
    }

    init() {
        // Handle browser back/forward
        window.addEventListener("popstate", () => {
            this.loadView(window.location.pathname);
        });

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
    router.loadView(window.location.pathname);
});
