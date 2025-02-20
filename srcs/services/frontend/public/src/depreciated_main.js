/*
** MESSAGE DE RINMA A RINMA : n'utilise pas cette page mais le router.js
*/


/*
** MAIN PAGE, ENTRYPOINT POUR LE FRONTEND
** FICHIER JS QUI INITIALISE LE TOUT ET CHARGE LES MODULES DE VUES
** -> ROUTER FRONTEND
** AU FUR ET A MESURE ON VA RENVOYER VERS LES FICHIER JS CORRESPONDANTS AUX VUES DEMANDEES
*/

// Fonction pour charger les modules de vues (home, jeu, 404)

//import Navbar from "./components/navbar.js";

function loadView(view)
{
    const app = document.getElementById('app');

    const currentURL = view;
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
        import('./views/PlayMenu.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/play-localy':
        import('./views/PlayLocal.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/about':
        import('./views/about.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/log-in':
        import('./views/log-in.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/signup':
        import('./views/signup.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/delete-user':
        import('./views/delete-user.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/edit-profile':
        import('./views/edit-profile.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/test_daya':
        import('./views/test_daya.js').then(module => { app.innerHTML = module.default();});
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
