import { cleanUpThree } from '../three/utils.js';
import BaseView from './BaseView.js';
import WebSocketService from './WebSocketService.js';

export default class BasePlayView extends BaseView{
    constructor(params){
        super(params);
        this.socketService = null;
        this.handleGameEnd = this.handleGameEnd.bind(this);
        this.handleTournamentGameEnd = this.handleTournamentGameEnd.bind(this);
		this.tournament_id = null;
    }

    async waitRoom() {
        const tournament = await this.sendPostRequest(this.API_URL_TOURNAMENT + 'result/',
            {
                "tournament_id": this.tournament_id
            });

        if (!tournament.success) {
            this.router.customClearInterval(this.router.RerenderTournamentIntervalPlay);
            console.error(tournament_result.error);
            return;
        }
    
        const tournament_data = tournament.data;
        if (tournament_data.status === 'finished' || tournament_data.result === 'lost') {
			if (tournament_data.status !== 'finished') {
                document.getElementById("status").innerText = "You lost the tournament, waiting for the tournament to end...";
			} else {
				this.router.customClearInterval(this.router.RerenderTournamentIntervalPlay);
				console.log("tournament ended");
				this.handleTournamentGameEnd()
			}
            return;
        }
        
        const rooms_data = await this.sendGetRequest(this.API_URL_TOURNAMENT + 'list_my_rooms/');
        if (rooms_data.success) {
            console.log(rooms_data.success)
            const data = rooms_data.data;
            console.log(data)
            const rooms = data.filter((room) => room.status === "waiting");
            if (rooms.length === 0) {
                document.getElementById("status").innerText = "Waiting for rooms";
            } else {
                this.router.customClearInterval(this.router.RerenderTournamentIntervalPlay);
                const room = rooms[0];
                console.log(room);
                document.getElementById("room-id").innerText = room.room_id;
                document.getElementById("status").innerText = "Room available";
                document.querySelector("canvas.webgl").innerText = "Loading...";
                document.getElementById("user-2").innerText = "Waiting for opponent...";
                this.openWebSocket(room.room_id);
                window.addEventListener("gameStarted", () => this.checkStart());
            }
        } else {
			const pools_data = await this.sendGetRequest(this.API_URL_TOURNAMENT + 'list_pools/' + this.tournament_id + '/');
			if (pools_data.success) {
				document.getElementById("status").innerText = pools_data.data;
			}
        }
    }

    async handleTournamentGameEnd(){
    }

    handleGameEnd(data, player1, player2){
		const winner = data.winner;
		const loser = data.loser;
		const winner_score = data.score_winner;
		const loser_score = data.score_loser;

		let winner_username;
		let loser_username;
		if (winner === 'player1') {
			winner_username = player1.username;
			loser_username = player2.username;
		} else {
			winner_username = player2.username;
			loser_username = player1.username;
		}
        console.log("game end")
        
        const finalScreen = document.createElement("div");
        finalScreen.id = "final-screen";
        finalScreen.innerHTML = `
            <h1>Game Over</h1>
            <p>${winner_username} won!</p>
            <p>score: ${winner_username} ${winner_score} - ${loser_username} ${loser_score}</p>
            <button id="back-to-waiting-rooms">Back to Waiting Rooms</button>
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
        document.getElementById("back-to-waiting-rooms").addEventListener("click", () => {
            const finalScreen = document.getElementById("final-screen");
            finalScreen.remove();
            cleanUpThree();
			this.waitRoom();
			try {
				this.router.RerenderTournamentIntervalPlay = setInterval(async () => { await this.waitRoom(); }, 5000);
			} catch (error) {
				console.error("Error in mount():", error);
			}
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
        if (this.socketService && this.socketService.isplaying){
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
        const my_tournament = await this.sendGetRequest(this.API_URL_TOURNAMENT + 'my_tournament/');
        if (!my_tournament.success) {
			alert("You are not in a tournament");
            this.router.customClearInterval(this.router.RerenderTournamentIntervalPlay);
			this.navigateTo("/play-menu");
            return;
        }
        this.tournament_id = my_tournament.data.tournament_id;

		this.waitRoom();
        try {
            this.router.RerenderTournamentIntervalPlay = setInterval(async () => { await this.waitRoom(); }, 5000);
        } catch (error) {
            console.error("Error in mount():", error);
        }
    }
    
    unmount () {
        
        this.router.customClearInterval(this.router.RerenderTournamentIntervalPlay);
    }
    
    
}
