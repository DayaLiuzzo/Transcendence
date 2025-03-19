import BaseView from './BaseView.js';
import WebSocketService from './WebSocketService.js';

export default class BasePlayView extends BaseView{
    constructor(params){
        super(params);
        this.socketService = null;
        this.handleGameEnd = this.handleGameEnd.bind(this);
        this.handleTournamentGameEnd = this.handleTournamentGameEnd.bind(this);
    }

    async joinRoom() {
        const result = await this.sendPostRequest(this.API_URL_ROOMS + 'join_room/', {});
        if (result.success) {
            console.log(result.success)
            console.log(result.data)

            document.getElementById("room-id").innerText = result.data.room_id;
            // document.getElementById("user-1").innerText = this.getUsername();
            document.getElementById("user-2").innerText = "Looking for opponent...";
            document.querySelector("canvas.webgl").innerText = "Loading...";
            this.openWebSocket(result.data.room_id);
            window.addEventListener("gameStarted", () => this.checkStart());
        } else {
            document.getElementById("room-id").innerText = "No room found, please reload";
        }
    }

    async handleTournamentGameEnd(){
    }

    handleGameEnd(winner, looser, winner_score, looser_score){
        console.log("game end")

        const finalScreen = document.createElement("div");
        finalScreen.id = "final-screen";
        finalScreen.innerHTML = `
            <h1>Game Over</h1>
            <p>${winner} wins!</p>
            <p>score: ${winner} ${winner_score} - ${looser} ${looser_score}</p>
            <button id="back-to-lobby">Back to Lobby</button>
        `;
        finalScreen.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 20px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: center;

        `;
        document.body.appendChild(finalScreen);
        document.getElementById("back-to-lobby").addEventListener("click", () => {
            document.body.removeChild(finalScreen);
            this.navigateTo("/play-menu");
        });
    }

    checkStart(){
        console.log(this.socketService);
        if (this.socketService.isplaying){
            document.querySelector("canvas.webgl").innerText = "Playing...";
            this.listenToKeyboard();
            window.addEventListener("keyboard", () => this.listenToKeyboard());
        }
    }

    listenToKeyboard() {
        console.log("Listening to keyboard")
        if (this.socketService.isplaying){
            console.log("wesh")
            window.addEventListener("keydown", (event) => {
                if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                    const movement = event.key === "ArrowUp" ? "up" : "down";
                    this.sendMovementToWebSocket(movement);
                }

            });
            window.addEventListener("keyup", (event) => {
                if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                    const movement = "idle";
                    this.sendMovementToWebSocket(movement);
                }
            });

        }
    }

    sendMovementToWebSocket(movement) {
        // Si la connexion WebSocket est active et le jeu a commencé, envoyer le mouvement
        //add condition pour checker que la websocket est ok
        this.socketService.sendMessage(movement);

    }

    // Ouvrir une WebSocket pour cette salle
    openWebSocket(roomId) {
        if (!this.socketService) {
            this.socketService = new WebSocketService(roomId);
            this.socketService.name = "init"
        }
        //try puis mettre this.socketservice a null si fail
        this.socketService.connect();
        this.socketService.name = "after connexion"
    }

    async test(){
        const result = await this.sendGetRequest(this.API_URL_ROOMS + 'test/')
        if (result.success){
            document.getElementById("response-result").innerText = "Success: " +  JSON.stringify(result.data, null, 2);
        }
        else {
            document.getElementById("response-result").innerText = "Error: " + JSON.stringify(result.error, null, 2);
        }
    }

    async mount() {
        try {
            await this.joinRoom();
        } catch (error) {
            console.error("Error in mount():", error);
        }
    }

    // async unmount() {
    //     console.log('Unmounting Play');
    //     if (this.socketService) {
    //         this.socketService.closeConnection();
    //         this.socketService = null;
    //     }
    // }
}

