export default function() {
    return `
    <div id="edit-profile-form" class="form-container">
      <h2>Editer votre profil</h2>
      <form>
        <label for="edit-username">Nom d'utilisateur:</label>
        <input type="text" id="edit-username" name="username" placeholder="Nom d'utilisateur actuel" required>

        <label for="edit-email">Email:</label>
        <input type="email" id="edit-email" name="email" placeholder="Votre nouvel email" required>

        <label for="edit-password">Mot de passe:</label>
        <input type="password" id="edit-password" name="password" placeholder="Votre nouveau mot de passe" required>

        <label for="edit-confirm-password">Confirmer le mot de passe:</label>
        <input type="password" id="edit-confirm-password" name="confirm-password" placeholder="Confirmer le mot de passe" required>

        <button type="submit">Sauvegarder les modifications</button>
      </form>
    </div>
    `;
  }
  