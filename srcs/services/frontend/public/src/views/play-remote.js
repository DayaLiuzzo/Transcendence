
export default function() {
  let ready = 0;

  // Créer un contenu HTML à insérer dans le DOM
  const htmlContent = `
  <h1>C'est la salle d'attente</h1>
  <img src="../media/waiting.jpg" alt="Profile picture" class="profile-img">
  <div id="roh"></div>
  `;
  
  // Insérer le contenu HTML dans un élément du DOM
  document.getElementById('app').innerHTML = htmlContent;
  setTimeout(() => {
    const messageElement = document.getElementById('roh');
    if (messageElement) messageElement.textContent = "Looking for a playroom"
    console.log(messageElement.textContent)
    
  }, 0);
  // Vérifier si les éléments existent avant de les mettre à jour
      
    // // Exécuter le code JavaScript (fetch) séparément pour récupérer les données via l'API
    // fetch('/api/room/g/')
    //   .then(response => response.json())
    //   .then(data => {

    //   })
    //   .catch(error => {
    //     console.error('Erreur lors de la récupération des données de l\'API:', error);
    //   });

    return htmlContent;
  }

