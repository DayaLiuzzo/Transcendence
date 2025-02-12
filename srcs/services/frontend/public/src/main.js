/*
** MAIN PAGE, ENTRYPOINT POUR LE FRONTEND
** FICHIER JS QUI INITIALISE LE TOUT ET CHARGE LES MODULES DE VUES
** -> ROUTER FRONTEND
** AU FUR ET A MESURE ON VA RENVOYER VERS LES FICHIER JS CORRESPONDANTS AUX VUES DEMANDEES
*/

// Fonction pour charger les modules de vues (home, jeu, 404)

import Navbar from "./components/navbar.js";

function loadView(view)
{
    const app = document.getElementById('app');

    const currentURL = view
    window.history.pushState("", document.title, currentURL.split('#')[0]);

   // document.getElementById("navbar").innerHTML = Navbar();

    switch (view) {
      case '/home':
        import('./views/home.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/':
        import('./views/home.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/play':
        import('./views/play.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/about':
        import('./views/about.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/log-in':
        import('./views/log-in.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/sign-up':
        import('./views/sign-up.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/delete-user':
        import('./views/delete-user.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/edit-profile':
        import('./views/edit-profile.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/game-custom':
        import('./views/game-custom.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/play-tournament':
        import('./views/play-tournament.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/game':
        import('./views/game.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/play-alone':
        import('./views/play-alone.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/game-ai':
        import('./views/game-ai.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/game-multi':
        import('./views/game-multi.js').then(module => { app.innerHTML = module.default();});
        break;
      default:
        import('./views/404.js').then(module => { app.innerHTML = module.default();});
        break;
    }
  }

document.querySelectorAll('a').forEach(link =>
{
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const view = link.getAttribute('href');
      loadView(view);
    });
});

window.addEventListener('DOMContentLoaded', () =>
{
  const view = window.location.pathname;
  loadView(view);
});

window.addEventListener('popstate', () =>
{
  const view = window.location.pathname;
  loadView(view);
})
