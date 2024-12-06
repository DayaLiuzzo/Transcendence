let connected = 1;
let data = null;

export default async function loadData() {
  try {
    const response = await fetch("https://localhost:4430/api/auth/welcome");
    
    // Vérifier si la réponse est OK (code 2xx)
    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }

    const data = await response.json();  // Récupérer directement les données
    renderPage(data);  // Rendre la page après récupération des données
    console.log(data);
  } catch (err) {
    console.error("Erreur lors de la récupération des données :", err);
    // Afficher un message d'erreur dans l'UI si l'API échoue
    document.getElementById("app").innerHTML = `
      <h1>Erreur</h1>
      <p>Impossible de charger les données de l'utilisateur.</p>
    `;
  }
}

function renderPage(data) {
  // Vérifie si l'utilisateur est connecté et ajuste l'interface en conséquence
  const content = connected 
    ? `
      <h1>Bienvenue ${data?.username || 'utilisateur'} !</h1>
      <p>C'est la vue principale de notre SPA.</p>
      <div class="grid-container">
        <div class="profile">
          <h2>${data?.username || 'Nom d\'utilisateur'} </h2>
          <img src="../media/mariah-carey-noel.jpeg" alt="Profile picture" class="profile-img">
          <div><a href="/edit-profile">Edit profile</a></div>
          <div><a href="/delete-user">Delete user</a></div>
        </div>
        <div class="item">
          <h2>Play</h2>
          <p> Ici on mettra une overview du jeu ! </p>
          <img src="../media/pong.jpg" alt="Profile picture" class="profile-img">
          <div><a href="/play">Play pong</a></div>
        </div>
      </div>` 
    : `
      <h1>Bienvenue sur la page d'accueil</h1>
      <p>C'est la vue principale de notre SPA.</p>
      <div class="grid-container">
        <div class="profile">
          <div><a href="/edit-profile">Log-in</a></div>
          <div><a href="/edit-profile">Sign up</a></div>
        </div>
        <div class="item">
          <p> Ici on mettra une overview du jeu ! </p>
        </div>
      </div>`;

  document.getElementById("app").innerHTML = content;
}

// Appel initial de loadData pour charger les données avant de rendre la page
loadData();
