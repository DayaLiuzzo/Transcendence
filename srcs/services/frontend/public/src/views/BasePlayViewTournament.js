import { cleanUpThree, cleanUpThreeTournament } from '../three/utils.js';
import BaseView from './BaseView.js';
import WebSocketService from './WebSocketService.js';

export default class BasePlayView extends BaseView{
    constructor(params){
        super(params);
        this.socketService = null;
        this.handleGameEnd = this.handle.bind(this);
        this.handleTournamentGameEnd = this.handleTournamentGameEnd.bind(this);
		this.tournament_id = null;
    }

    async waitRoom() {
		if (this.socketService) {
			if (this.socketService.isConnected) {
				this.router.customClearInterval(this.router.RerenderTournamentIntervalPlay);
				return;
			}
		}
        const tournament = await this.sendPostRequest(this.API_URL_TOURNAMENT + 'result/',
            { "tournament_id": this.tournament_id });

        if (!tournament.success) {
            this.router.customClearInterval(this.router.RerenderTournamentIntervalPlay);
            this.showError(tournament_result.error, "tournament-waiting-room");
            return;
        }

        const tournament_data = tournament.data;
        if (tournament_data.status === 'finished' || tournament_data.result === 'lost') {
			if (tournament_data.status !== 'finished') {
                document.getElementById("status").innerText = "You lost the tournament, waiting for the tournament to end...";
			} else {
				this.router.customClearInterval(this.router.RerenderTournamentIntervalPlay);
				this.handleTournamentGameEnd(tournament_data.result)
			}
            return;
        }

        const rooms_data = await this.sendGetRequest(this.API_URL_TOURNAMENT + 'list_my_rooms/');
        if (rooms_data.success) {
            const data = rooms_data.data;
            const rooms = data.filter((room) => room.status === "waiting");
            if (rooms.length === 0) {
				const pools_data = await this.sendGetRequest(this.API_URL_TOURNAMENT + 'list_pools/' + this.tournament_id + '/');
				if (pools_data.success) {
				const data = pools_data.data;
				const pool_section = document.createElement("div");
				pool_section.id = "pool_section";

				data.forEach((pool) => {
					const pool_name = document.createElement("h3");
					pool_name.id = "pool_name";
					pool_name.innerText = pool.name;

					const list_rooms = document.createElement("ul");
					list_rooms.id = "list_rooms";
					const rooms = pool.rooms;
					rooms.forEach((room) => {
						const room_section = document.createElement("li");
						room_section.id = "room_section";
						room_section.innerText = `${room.player1} vs ${room.player2} - ${room.status}`;
						list_rooms.appendChild(room_section);
					});

					pool_section.appendChild(pool_name);
					pool_section.appendChild(list_rooms);
				});

				const status = document.getElementById("status");
				status.innerHTML = "Waiting for the rooms of the pools to be finished...";
				status.appendChild(pool_section);
                document.getElementById("room-id").innerText = "";
                document.querySelector("canvas.webgl").innerText = "";
                document.getElementById("user-2").innerText = "";
				}
            } else {
                const room = rooms[0];
                console.log(room);
                document.getElementById("room-id").innerText = room.room_id;
                document.getElementById("status").innerText = "Room available";
                document.querySelector("canvas.webgl").innerText = "Loading...";
                document.getElementById("user-2").innerText = "Waiting for opponent...";
				if (!this.socketService || !this.socketService.isConnected) {
					this.openWebSocket(room.room_id);
				}
            }
        }
    }

    async handleTournamentGameEnd(result) {
		console.log("tournament ended");
		document.getElementById("room-id").innerText = "";
		document.querySelector("canvas.webgl").innerText = "";
		document.getElementById("user-2").innerText = "";
		const status = document.getElementById("status");
		status.innerHTML = `<p>The tournament ended.</p>`;
		const tournament_detail = await this.sendGetRequest(this.API_URL_TOURNAMENT + "detail/" + this.tournament_id + "/");
		if (tournament_detail.success) {
			const data = tournament_detail.data;
			status.innerHTML += `<p>You ${result}!</p>`;
			status.innerHTML += `<p>The winner is ${data.winner}!</p>`;
			status.innerHTML += `<button id="back-to-lobby">Back to Lobby</button>`;
		}
		document.getElementById("back-to-lobby").addEventListener("click", () => {
			this.navigateTo("/play-menu");
		});
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
		console.log("waiting_rooms");
		cleanUpThree();
		const container_canvas = document.getElementById("container-canvas");
		container_canvas.innerHTML = `<canvas class="webgl"></canvas>`
        document.body.appendChild(finalScreen);
        document.getElementById("back-to-waiting-rooms").addEventListener("click", async () => {
			console.log("waiting_rooms clicked");
            const finalScreen = document.getElementById("final-screen");
            finalScreen.remove();

			await this.waitRoom();

			try {
				this.router.RerenderTournamentIntervalPlay = setInterval(async () => { await this.waitRoom(); }, 5000);
			} catch (error) {
				console.error("Error in mount():", error);
			}
        });
    }

    // Ouvrir une WebSocket pour cette salle
    openWebSocket(roomId) {
		this.socketService = new WebSocketService(roomId);
		this.socketService.name = "init";
		this.socketService.connect();
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
			this.customAlert("You are not in a tournament");
            this.router.customClearInterval(this.router.RerenderTournamentIntervalPlay);
			this.navigateTo("/play-menu");
            return;
        }
        this.tournament_id = my_tournament.data.tournament_id;

		await this.waitRoom();
		try {
			this.router.RerenderTournamentIntervalPlay = setInterval(async () => { await this.waitRoom(); }, 5000);
		} catch (error) {
			console.error("Error in mount():", error);
		}
    }

    unmount () {
		console.log("Unmounted BasePlayViewTournament");
        this.router.customClearInterval(this.router.RerenderTournamentIntervalPlay);
    }


}
