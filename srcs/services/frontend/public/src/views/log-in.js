export default function() {
    return `
      <h1>log-in</h1>
      <p>C'est ici quon va avoir notre form</p>

      <div id="login-form" class="form-container">
    <h2>Log-in</h2>
    <form>
      <label for="login-email">Email:</label>
      <input type="email" id="login-email" name="email" placeholder="Votre email" required>
      <label for="login-password">Mot de passe:</label>
      <input type="password" id="login-password" name="password" placeholder="Votre mot de passe" required>
      <button type="submit">Se connecter</button>
      <p class="signup-link">Pas encore de compte ? <a href="/sign-up">Créer un compte</a></p>
    </form>
  </div>
    `;
  }
  