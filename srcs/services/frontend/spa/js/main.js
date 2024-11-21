// Fonction pour charger les modules de vues (home, jeu, 404)
function loadView(view) {
    const app = document.getElementById('app');
  
    // Vérification des vues disponibles et importation de la vue correspondante
    switch (view) {
      case 'home':
        import('./home.js').then(module => {
          app.innerHTML = module.default();
        });
        break;
      case 'jeu':
        import('./jeu.js').then(module => {
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
      const view = link.getAttribute('href').replace('#', ''); // On prend la partie après le hash
      window.location.hash = view;  // Change l'URL dans la barre d'adresse
      loadView(view);  // Charge la vue correspondante
    });
  });
  
  // Gérer les changements dans l'URL via l'API hashchange
  window.addEventListener('hashchange', () => {
    const view = window.location.hash.replace('#', '') || 'home';  // Par défaut, on charge "home"
    loadView(view);
  });
  
  // Charger la vue par défaut au chargement de la page
  window.addEventListener('DOMContentLoaded', () => {
    const view = window.location.hash.replace('#', '') || 'home';  // Vérifie l'URL
    loadView(view);
  });
  