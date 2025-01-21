let ready = 1;

export default function() {
  if (ready) {
    // Créer un contenu HTML à insérer dans le DOM
    const htmlContent = `
      <h1>Play in tournament</h1>
      <p>Ici on va jouuuuer</p>
      <img src="../media/pong_1.gif" alt="Profile picture" class="profile-img">
      <div id="room-name"></div>
      <div id="message"></div>
      <div id="players-count"></div>
    `;

    // Insérer le contenu HTML dans un élément du DOM
    document.getElementById('app').innerHTML = htmlContent;

    // Exécuter le code JavaScript (fetch) séparément pour récupérer les données via l'API
    fetch('/api/game/room123/')
      .then(response => response.json())
      .then(data => {
        // Vérifier si les éléments existent avant de les mettre à jour
        const roomNameElement = document.getElementById('room-name');
        const messageElement = document.getElementById('message');
        const playersCountElement = document.getElementById('players-count');

        if (roomNameElement) roomNameElement.textContent = data.room_name;
        if (messageElement) messageElement.textContent = data.message;
        if (playersCountElement) playersCountElement.textContent = data.players_count || "0";  // Valeur par défaut
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des données de l\'API:', error);
      });

    // Créer une connexion WebSocket sécurisée
    const socket = new WebSocket('wss://' + window.location.host + '/ws/game/' + 'lol/');

    // Lorsqu'une connexion est établie
    socket.onopen = function() {
      console.log("Connexion WebSocket sécurisée établie!");
    };

    // Lorsqu'un message est reçu du serveur
    socket.onmessage = function(event) {
      const data = JSON.parse(event.data);
      console.log("Message reçu:", data);

      // Mettre à jour le DOM avec les données reçues via WebSocket
      const roomNameElement = document.getElementById('room-name');
      const messageElement = document.getElementById('message');
      const playersCountElement = document.getElementById('players-count');

      if (roomNameElement) roomNameElement.textContent = data.room_name || roomNameElement.textContent;
      if (messageElement) messageElement.textContent = data.message || messageElement.textContent;
      if (playersCountElement) playersCountElement.textContent = data.players_count || playersCountElement.textContent;
    };

    // Lors de la fermeture de la connexion
    socket.onclose = function(event) {
      console.log("Connexion WebSocket fermée", event);
    };

    // Fonction pour envoyer des messages via WebSocket
    function sendMessage(message) {
      socket.send(JSON.stringify({ 'message': message }));
    }

    // Exemple d'envoi de message (vous pouvez l'appeler plus tard selon l'interaction de l'utilisateur)
    // sendMessage('Hello, server!');

    return htmlContent;
  } else {
    return `
      <h1>Wait room</h1>
      <div id="loader-container">
        <div class="loader"></div>
      </div>
    `;
  }
}
