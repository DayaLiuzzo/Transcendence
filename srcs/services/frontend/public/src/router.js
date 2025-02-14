import BaseView from "./views/BaseView.js";
import Home from "./views/home.js";
import LogIn from "./views/LogIn.js";


const routes = [
    { path: '/', view: Home },
    { path: '/home', view: Home },
    // { path: '/play', view: 'play' },
    // { path: '/about', view: 'about' },
    { path: '/log-in', view: LogIn },
    // { path: '/signup', view: 'signup' },
    // { path: '/delete-user', view: 'delete-user' },
    // { path: '/edit-profile', view: 'edit-profile' },
    // { path: '/game-custom', view: 'game-custom' },
    // { path: '/play-tournament', view: 'play-tournament' },
    // { path: '/game', view: 'game' },
    // { path: '/play-alone', view: 'play-alone' },
    // { path: '/game-ai', view: 'game-ai' },
    // { path: '/game-multi', view: 'game-multi' },
    // { path: '/test_daya', view: 'test_daya' }
];


class Router{
    constructor(routes){
        this.routes = routes;
    }

    getRoutes(){
        return this.routes;
    }

    getRoute(path){
        return this.routes.find(route => route.path === path);
    }

    async loadView(path){
        const route = this.getRoute(path);
        if (!route) {
            console.error("Error: Route not found");
            return;
        }
        const ViewClass = route.view;
        const view = new ViewClass();
        await view.mount();
        view.attachEvents();
        }
}

const router = new Router(routes);


document.querySelectorAll('a').forEach(link =>
    {
        link.addEventListener('click', function (e) {
          e.preventDefault();
          const viewPath = link.getAttribute('href');
          router.loadView(viewPath);
        });
    });
    
    window.addEventListener('DOMContentLoaded', () =>
    {
      const viewPath = window.location.pathname;
      router.loadView(viewPath);
    });
    
    window.addEventListener('popstate', () =>
    {
      const viewPath = window.location.pathname;
      router.loadView(viewPath);
    })
    