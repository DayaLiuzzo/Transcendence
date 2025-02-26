export default class WebSocketService {
    constructor(roomName) {
        this.roomName = roomName;
        this.socket = null;
        this.isConnected = false;
        this.WS_GAME_URL = `wss://${window.location.host}/ws/game/`;
    }

    connect() {
        const url = `${this.WS_GAME_URL}${this.roomName}/`;
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            this.isConnected = true;
            console.log("Connexion WebSocket sécurisée établie!");
        };

        this.socket.onmessage = (event) => {
            this.handleMessage(event);
        };

        this.socket.onclose = (event) => {
            this.isConnected = false;
            console.log("Connexion WebSocket fermée", event);
        };

        this.socket.onerror = (error) => {
            console.error("Erreur WebSocket: ", error);
        };
    }

    // // Fonction pour traiter les messages reçus
    // handleMessage(event) {
    //     const data = JSON.parse(event.data);
    //     console.log("Message reçu:", data);

    //     // Mettre à jour le DOM avec les données reçues via WebSocket
    //     const roomNameElement = document.getElementById('room-name');
    //     const messageElement = document.getElementById('message');
    //     const playersCountElement = document.getElementById('players-count');

    //     if (roomNameElement) roomNameElement.textContent = data.room_name || roomNameElement.textContent;
    //     if (messageElement) messageElement.textContent = data.message || messageElement.textContent;
    //     if (playersCountElement) playersCountElement.textContent = data.players_count || playersCountElement.textContent;
    // }

    // // Fonction pour envoyer des messages via WebSocket
    // sendMessage(message) {
    //     if (this.isConnected && this.socket) {
    //         this.socket.send(JSON.stringify({ 'message': message }));
    //         console.log("Message envoyé:", message);
    //     } else {
    //         console.error("La connexion WebSocket n'est pas établie.");
    //     }
    // }

    closeConnection() {
        if (this.isConnected && this.socket) {
            this.socket.close();
        }
    }

    isConnected() {
        return this.isConnected;
    }
}
