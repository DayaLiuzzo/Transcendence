import Home from "./views/home.js";
import LogIn from "./views/LogIn.js";
import NotFound from "./views/NotFound.js";
import SignUp from "./views/SignUp.js";
import Game from "./views/Game.js";

const routes = [
    { path: '/', view: Home },
    { path: '/home', view: Home },
    { path: '/log-in', view: LogIn },
    { path: '/sign-up', view: SignUp },
    { path: '/game', view: Game },
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

    async loadView(path){
        const route = this.getRoute(path);
        const ViewClass = route ? route.view : NotFound;
        if (!route) {
            console.warn(`Route for ${path} not found! Showing NotFound view.`);
        }
        const view = new ViewClass(this);
        await view.mount();
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
