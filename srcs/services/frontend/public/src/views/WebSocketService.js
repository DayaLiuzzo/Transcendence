export default class WebSocketService {
    constructor(roomName) {
        this.roomName = roomName;
        this.socket = null;
        this.isConnected = false;
        this.WS_GAME_URL = `wss://${window.location.host}/ws/game/`;
        this.token = this.getAccessToken();
        this.isplaying = false;
        this.name = "pas init"
		this.handleKeyDown = (event) => {
			if (event.key === "ArrowUp" || event.key === "ArrowDown") {
				const movement = event.key === "ArrowUp" ? "up" : "down";
				this.sendMessage(movement);
			}
		};
		this.handleKeyUp = (event) => {
			if (event.key === "ArrowUp" || event.key === "ArrowDown") {
				const movement = "idle";
				this.sendMessage(movement);
				}
			}
		};

    connect() {
        const url = `${this.WS_GAME_URL}${this.roomName}/`;
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            this.isConnected = true;
            // console.log("Connexion WebSocket sécurisée établie!");
            if (this.token) {
                this.sendMessage({ Authorization: `Bearer ${this.token}`});
            }
			this.listenToKeyboard();
        };

        this.socket.onmessage = (event) => {
            if (this.isplaying == false){
                this.handleStart(event);
            }
            else {
                this.handleMessage(event);
            }
        };

        this.socket.onclose = (event) => {
            this.isConnected = false;
			this.unlistenToKeyboard();
            // console.log("Connexion WebSocket fermée", event);
        };

        this.socket.onerror = (error) => {
            // console.error("Erreur WebSocket: ", error);
        };
    }

    handleStart(event) {
        const data = JSON.parse(event.data);
        // console.log("Message reçu:", data);
        if (data.message && data.message.state === 'START')
        {
            if (document.getElementById("waitingGameCanva"))
            {
                const waitingGameCanva = document.getElementById("waitingGameCanva");
                waitingGameCanva.remove();
            }
            document.querySelector("canvas.webgl").innerText = "Playing...";
            this.isplaying = true;
            const event = new CustomEvent("initSettingsGame", { detail: data.message});
            window.dispatchEvent(event);
        }
        // console.log("Is playing ?", this.isplaying)
    }

    handleMessage(event) {
        const data = JSON.parse(event.data);
        // console.log("Msg reçu:", data.message);
        if (data.message.state === 'INFO') {
            const event = new CustomEvent("updateGame", { detail: data.message});
            window.dispatchEvent(event);
        }
		else if (data.message.state === 'SCORE') {
            const event = new CustomEvent("updateScore", { detail: data.message});
            window.dispatchEvent(event);
        }
		else if (data.message.state === 'COLLISION') {
            const event = new CustomEvent("handleCollision", { detail: data.message});
            window.dispatchEvent(event);
        }
		else if (data.message.state === 'END') {
            const event = new CustomEvent("handleEndGame", { detail: data.message});
            window.dispatchEvent(event);
        }
    }

    sendMessage(message) {
        if (this.isConnected && this.socket) {
            this.socket.send(JSON.stringify({message}));
            // console.log("Message envoyé:", message);
        } else {
            // console.error("La connexion WebSocket n'est pas établie.");
        }
    }

    sendMovementToWebSocket(movement) {
        // Si la connexion WebSocket est active et le jeu a commencé, envoyer le mouvement
        //add condition pour checker que la websocket est ok
        this.socketService.sendMessage(movement);

    }

    closeConnection() {
        if (this.isConnected && this.socket) {
            // console.log("HELLLOOOOOOOOOOO");
            this.socket.close();
            this.socket = null;
            this.isConnected = false;
            this.isplaying = false;
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

    listenToKeyboard() {
        // console.log("Listening to keyboard")
		window.addEventListener("keydown", this.handleKeyDown);
		window.addEventListener("keyup", this.handleKeyUp);
    }

    unlistenToKeyboard() {
        // console.log("Unlistening to keyboard")
		window.removeEventListener("keydown", this.handleKeyDown);
		window.removeEventListener("keyup", this.handleKeyUp);
    }
}
