let connected = 1;
export default function() {
  if (connected)
  {
    return `
    <h1>Bienvenue sur la page d'accueil</h1>
    <p>C'est la vue principale de notre SPA.</p>

    <div class="grid-container">

      </div>

      <div class="item">
        <h2>Play</h2>
        <p>
          Ici on mettra une overview du jeu !
        </p>
        <img src="../assets/images/pong.jpg" alt="Profile picture" class="profile-img">
        <div><a href="/play">Play pong</a></div>
      </div>


      </div>
          </div>
        `;
      }
  else {
    return `
    <h1>Bienvenue sur la page d'accueil</h1>
    <p>C'est la vue principale de notre SPA.</p>
    <div class="grid-container">
    <div class="profile">
    <div><a href="/edit-profile">Log-in</a></div>
    <div><a href="/edit-profile">Sign up</a></div>
    </div>
    <div class="item">
    <p>
    Ici on mettra une overview du jeu !
    </p>

    </div>
    <div class="item">
      <h2>Custom game</h2>
      <p>Ici on mettra une overview des settings du jeu !</p>
   alt="Profile picture" class="profile-img">
    </div>

  </div>
        `;
  }
}
