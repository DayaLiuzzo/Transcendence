export default function() {
    return `
      <h1>Sign up</h1>
      <p>C'est ici quon va avoir notre form</p>

    <div id="signup-form" class="form-container">
      <h2>Sign Up</h2>
      <form>
        <label for="signup-username">Nom d'utilisateur:</label>
        <input type="text" id="signup-username" name="username" placeholder="Votre nom d'utilisateur" required>
        <label for="signup-email">Email:</label>
        <input type="email" id="signup-email" name="email" placeholder="Votre email" required>
        <label for="signup-password">Mot de passe:</label>
        <input type="password" id="signup-password" name="password" placeholder="Votre mot de passe" required>
        <button type="submit">Créer un compte</button>
      </form>
      <p class="signup-link">Deja inscrit-e ? <a href="/log-in">Se connecter</a></p>
    </div>
    `;
  }
  