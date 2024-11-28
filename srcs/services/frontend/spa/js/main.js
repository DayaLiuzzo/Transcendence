// Fonction pour charger les modules de vues (home, jeu, 404)
function loadView(view)
{
    const app = document.getElementById('app');

    const currentURL = view
    window.history.pushState("", document.title, currentURL.split('#')[0]);
    
    switch (view) {
      case '/home':
        import('./home.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/':
        import('./home.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/play':
        import('./play.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/about':
        import('./about.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/log-in':
        import('./log-in.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/sign-up':
        import('./sign-up.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/delete-user':
        import('./delete-user.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/edit-profile':
        import('./edit-profile.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/game-custom':
        import('./game-custom.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/play-tournament':
        import('./play-tournament.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/game':
        import('./game.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/play-alone':
        import('./play-alone.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/game-ai':
        import('./game-ai.js').then(module => { app.innerHTML = module.default();});
        break;
      case '/game-multi':
        import('./game-multi.js').then(module => { app.innerHTML = module.default();});
        break;
      default:
        import('./404.js').then(module => { app.innerHTML = module.default();});
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
  