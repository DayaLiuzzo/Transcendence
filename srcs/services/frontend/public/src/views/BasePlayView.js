import BaseView from './BaseView.js';
import WebSocketService from './WebSocketService.js';

export default class BasePlayView extends BaseView{
    constructor(params){
        super(params);
        this.socketService = null;
        this.handleGameEnd = this.handleGameEnd.bind(this);
    }

    async joinRoom() {
        const result = await this.sendPostRequest(this.API_URL_ROOMS + 'join_room/', {});
        if (result.success) {
            document.getElementById("room-id").innerText = result.data.room_id;
            // document.getElementById("user-1").innerText = this.getUsername();
            document.getElementById("user-2").innerText = "Looking for opponent...";
            document.querySelector("canvas.webgl").innerText = "Loading...";

			if (!this.socketService || !this.socketService.IsConnected) {
				this.openWebSocket(result.data.room_id);
			}
        } else {
            document.getElementById("room-id").innerText = "No room found, please reload";
        }
    }

    handleGameEnd(data, player1, player2){
		const winner = data.winner;
		const loser = data.loser;
		const score_winner = data.score_winner;
		const score_loser = data.score_loser;

		let winner_username;
		let loser_username;
		if (winner === 'player1') {
			winner_username = player1.username;
			loser_username = player2.username;
		} else {
			winner_username = player2.username;
			loser_username = player1.username;
		}


        const finalScreen = document.createElement("div");
        finalScreen.id = "final-screen";
        finalScreen.innerHTML = `
            <h1>Game Over</h1>
            <p>${winner_username} won!</p>
            <p>score: ${winner_username} ${score_winner} - ${loser_username} ${score_loser}</p>
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

    // Ouvrir une WebSocket pour cette salle
    openWebSocket(roomId) {
		this.socketService = new WebSocketService(roomId);
		this.socketService.name = "init"
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

}

