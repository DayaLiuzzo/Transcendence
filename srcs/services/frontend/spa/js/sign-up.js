export default function setupSignupForm() {
  // Retourne le HTML du formulaire
  return `
    <h1>Sign up</h1>
    <p>C'est ici qu'on va avoir notre formulaire</p>

    <div id="signup-form" class="form-container">
      <h2>Sign Up</h2>
      <form id="signup-form-element">
        <label for="signup-username">Nom d'utilisateur:</label>
        <input type="text" id="signup-username" name="username" placeholder="Votre nom d'utilisateur" required>
        <label for="signup-email">Email:</label>
        <input type="email" id="signup-email" name="email" placeholder="Votre email" required>
        <label for="signup-password">Mot de passe:</label>
        <input type="password" id="signup-password" name="password" placeholder="Votre mot de passe" required>
        <button type="submit">Créer un compte</button>
      </form>
      <p class="signup-link">Déjà inscrit-e ? <a href="/log-in">Se connecter</a></p>
    </div>
  `;
}

function getCsrfToken() {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === 'csrftoken') {
      return value;
    }
  }
  return null;
}

const csrfToken = getCsrfToken();


// Fonction pour attacher le gestionnaire d'événements après avoir inséré le HTML
export function attachSignupFormHandler() {
  const form = document.getElementById('signup-form-element');

  form.addEventListener('submit', async (event) => {
      event.preventDefault(); // Empêche le rechargement de la page
      
      // Récupère les données du formulaire
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      try {
          // Envoie une requête POST au backend
          const response = await fetch('https://localhost:4430/api/auth/signup', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'X-CSRFToken': csrfToken, // Inclure le token CSRF ici
              },
              body: JSON.stringify(data),
              credentials: 'include', // Permet d'envoyer les cookies
          });

          if (!response.ok) {
              const error = await response.json();
              console.error('Erreur:', error);
              alert(`Erreur: ${error.detail || 'Une erreur est survenue.'}`);
              return;
          }

          const result = await response.json();
          console.log('Succès:', result);
          alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');

          // Redirige l'utilisateur vers la page de connexion
          window.location.href = '/log-in';
      } catch (error) {
          console.error('Erreur de réseau:', error);
          alert('Impossible de contacter le serveur. Veuillez réessayer plus tard.');
      }
  });
}
