let ready = 1;

export default function() {
  if (ready) {
    // Créer un contenu HTML à insérer dans le DOM
    const htmlContent = `
      <h1>Play in tournament</h1>
      <p>Ici on va jouuuuer</p>
      <img src="../media/pong_1.gif" alt="Profile picture" class="profile-img">
    `;
  }
else
  return `
  <h1>Wait room</h1>
  <div id="loader-container">
    <div class="loader"></div>
  </div>
  `;
}

