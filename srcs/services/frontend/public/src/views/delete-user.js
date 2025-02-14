export default function() {
    return `
      <h1>Delete profile</h1>
      <p>C'est ici qu'on va avoir le formulaire de suppression</p>

      <div id="delete-account-form" class="form-container">
      <h2>Delete Account</h2>
      <form>
      <label for="delete-email">Email:</label>
      <input type="email" id="delete-email" name="email" placeholder="Votre email" required>
      <label for="delete-password">Mot de passe:</label>
      <input type="password" id="delete-password" name="password" placeholder="Votre mot de passe" required>
      <button type="submit" style="background-color: red; color: white;">Supprimer mon compte</button>
      </form>
      </div>
    <img src="../media/afida.jpeg" alt="Profile picture" class="profile-img">
    `;
  }
