// Fonction pour charger les modules de vues (home, jeu, 404)
function loadView(view) {
    const app = document.getElementById('app');
    // Vérification des vues disponibles et importation de la vue correspondante
    // Step 1: Access the current URL

    // Remove hash from the url if /home#rerer -> /home
    const currentURL = window.location.pathname
    // if (!currentURL.endsWith('/')) currentURL += '/';
    window.history.pushState("", document.title, currentURL.split('#')[0]);
    
    switch (view) {
      case '/home':
        import('./home.js').then(module => {
          app.innerHTML = module.default();
        });
        break;
      case '/play':
        import('./play.js').then(module => {
          app.innerHTML = module.default();
        });
        break;
        case '/about':
          import('./about.js').then(module => {
            app.innerHTML = module.default();
          });
          break;
          case '/login':
            import('./login.js').then(module => {
              app.innerHTML = module.default();
            });
            break;  
      default:
        import('./404.js').then(module => {
          app.innerHTML = module.default();
        });
        break;
    }
  }
  
  // Gérer les liens dans la navigation
  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const view = link.getAttribute('href'); // On prend la partie après le hash
      window.location.pathname = view;  // Change l'URL dans la barre d'adresse
      loadView(view);  // Charge la vue correspondante
    });
  });
  
  // Gérer les changements dans l'URL via l'API hashchange
  window.addEventListener('hashchange', () => {
    // const view = window.location.pathname.replace('#', '') || '404';  // Par défaut, on charge "home"
    const view = window.location.pathname;  // Par défaut, on charge "home"
    loadView(view);
  });
  
  // Charger la vue par défaut au chargement de la page
  window.addEventListener('DOMContentLoaded', () => {
    const view = window.location.pathname;  // Vérifie l'URL
    console.log('window location object:', window.location)
    loadView(view);
  });
  