export default class WebSocketService {
    constructor(roomName) {
        this.roomName = roomName;
        this.socket = null;
        this.isConnected = false;
        this.WS_GAME_URL = `wss://${window.location.host}/ws/game/`;
        this.token = this.getAccessToken();
        this.isplaying = false;
        this.name = "pas init"
    }

    connect() {
        const url = `${this.WS_GAME_URL}${this.roomName}/`;
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            this.isConnected = true;
            console.log("Connexion WebSocket sécurisée établie!");
            if (this.token) {
                this.sendMessage({ Authorization: `Bearer ${this.token}`});
            }
        };

        this.socket.onmessage = (event) => {
            if (this.isplaying == false){
                this.handleStart(event);

                const e = new CustomEvent("gameStarted");

                window.dispatchEvent(e);
            }
            else {
                this.handleMessage(event);
            }
        };

        this.socket.onclose = (event) => {
            this.isConnected = false;
            console.log("Connexion WebSocket fermée", event);
        };

        this.socket.onerror = (error) => {
            console.error("Erreur WebSocket: ", error);
        };
    }

    handleStart(event) {
        const data = JSON.parse(event.data);
        console.log("Message reçu:", data);
        if (data.message.state === 'START')
        {
            this.isplaying = true;
            const event = new CustomEvent("initSettingsGame", { detail: data.message});
            window.dispatchEvent(event);
        }
        console.log("Is playing ?", this.isplaying)
    }

    handleMessage(event) {
        const data = JSON.parse(event.data);
        console.log("Msg reçu:", data.message);
        if (data.message.state === 'INFO') {
            const event = new CustomEvent("updateGame", { detail: data.message});
            window.dispatchEvent(event);
        }
        if (data.message.state === 'SCORE') {
            const event = new CustomEvent("updateScore", { detail: data.message});
            window.dispatchEvent(event);
        }
        if (data.message.state === 'COLLISION') {
            const event = new CustomEvent("handleCollision", { detail: data.message});
            window.dispatchEvent(event);
        }
        if (data.message.state === 'END') {
            const event = new CustomEvent("handleEndGame", { detail: data.message});
            window.dispatchEvent(event);
        }
    }

    sendMessage(message) {
        if (this.isConnected && this.socket) {
            this.socket.send(JSON.stringify({message}));
            console.log("Message envoyé:", message);
        } else {
            console.error("La connexion WebSocket n'est pas établie.");
        }
    }

    closeConnection() {
        if (this.isConnected && this.socket) {
            this.socket.close();
        }
    }

    isConnected() {
        return this.isConnected;
    }

    getUserSession(){
        return JSON.parse(localStorage.getItem("userSession"));
    }

    getAccessToken(){
        const userSession = this.getUserSession();
        if(userSession){
            return userSession.access_token;
        }
        return null;
    }
}
