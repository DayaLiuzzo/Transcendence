import BaseView from './BaseView.js';
import WebSocketService from './WebSocketService.js';

export default class BasePlayView extends BaseView{
    constructor(params){
        super(params);
        this.socketService = null;
        this.handleGameEnd = this.handleGameEnd.bind(this);
        this.handleTournamentGameEnd = this.handleTournamentGameEnd.bind(this);
    }

    createContainer(containerName){
        const container = document.createElement("div");
        container.id = containerName;
        return container;
    }


    createWaitingGameContainer(result){
        
        const container = document.getElementById("container");
        const waitingGameContainer = document.createElement("div");
        waitingGameContainer.id = "waitingGameContainer";

        const canvas = this.createContainer("waitingGameCanva");

        const headerCanva = this.createContainer("headerCanva");
        const progressBar = this.createContainer("progressBar");
        const gameScreen = this.createContainer("gameScreen");
        const gameBoxes = this.createContainer("gameBoxes");
        const numbers = [];
        for(let i = 1; i <= 78; i++){
            const numberValue = Math.floor(Math.random() * 10);
            const number = document.createElement("div");
            number.className = "number";
            number.id = `number-${i}`;
            number.innerHTML = numberValue;
            numbers.push(number);
            gameScreen.appendChild(number);
        }

        gameScreen.addEventListener("mousemove", (e) => {
            numbers.forEach(number => {
                const rect = number.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const deltaX = Math.abs(centerX - e.clientX);
                const deltaY = Math.abs(centerY - e.clientY);
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                const maxDistance = Math.sqrt(rect.width * rect.width + rect.height * rect.height) / 2;
                const scale = Math.max(0, 1 - distance / (maxDistance * 1.5));
                const shakeIntensity = Math.max(0, 1 - distance / (maxDistance * 1.5));
    
                if (distance < maxDistance * 2 ) {
                    number.style.fontSize = `${1.5 + scale * 2.5}em`; // Increase the scale factor for more dramatic effect
                    number.style.animation = `shake ${1 + shakeIntensity * 1}s infinite`; // Adjust shake intensity
                } else {
                    if(number.classList.contains('emphasized')){
                        console.log(number.innerHTML);
                    }
                    else{
                        console.log(number.innerHTML);
                        number.style.fontSize = "1.5em"; 
                        number.style.animation = "none";
                    }
                }
            });
        });

        const names = ["WO", "FC", "DR", "MA"];
        for (let i = 0; i < 4; i++){
            const gameBox = document.createElement("div");
            gameBox.className = "gameBox";
            gameBox.id = `gameBox-${i}`;
            gameBox.innerHTML = names[i];
            gameBoxes.appendChild(gameBox);
        }
        const logoLumon = document.createElement("img");
        logoLumon.src = "/media/happy.svg";
        logoLumon.alt = "logo";
        logoLumon.className = "logoLumon"

        progressBar.innerHTML = "Cold Harbour_____________57% Completed";
        
        
        waitingGameContainer.appendChild(headerCanva);
        headerCanva.appendChild(progressBar);
        progressBar.appendChild(logoLumon);
        waitingGameContainer.appendChild(gameScreen);
        waitingGameContainer.appendChild(gameBoxes);
        
        const child = document.getElementById("container-canvas");
        container.insertBefore(canvas, child);
        const bezel = this.createContainer("bezel");
        canvas.appendChild(bezel);
        canvas.appendChild(waitingGameContainer);
        // container.insertBefore(waitingGameContainer, child);
        return waitingGameContainer;

    }

    displayWaitingGame(result){
        const waitingCanvas = this.createWaitingGameContainer(result);
        
    }

    async joinRoom() {
        const result = await this.sendPostRequest(this.API_URL_ROOMS + 'join_room/', {});
        if (result.success) {
            this.displayWaitingGame(result.data.room_id);
            this.openWebSocket(result.data.room_id);
            window.addEventListener("gameStarted", () => this.checkStart());
        } else {
            document.getElementById("room-id").innerText = "No room found, please reload";
        }
    }



    // async joinRoom() {
    //     const result = await this.sendPostRequest(this.API_URL_ROOMS + 'join_room/', {});
    //     if (result.success) {

    //         document.getElementById("room-id").innerText = result.data.room_id;
    //         // document.getElementById("user-1").innerText = this.getUsername();
    //         document.getElementById("user-2").innerText = "Looking for opponent...";
    //         document.querySelector("canvas.webgl").innerText = "Loading...";
    //         this.openWebSocket(result.data.room_id);
    //         window.addEventListener("gameStarted", () => this.checkStart());
    //     } else {
    //         document.getElementById("room-id").innerText = "No room found, please reload";
    //     }
    // }

    async handleTournamentGameEnd(){
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

        // console.log("game end")

        const finalScreen = document.createElement("div");
        finalScreen.id = "final-screen";
        finalScreen.innerHTML = `
            <h1>Game Over</h1>
            <p>${winner_username} won!</p>
            <p>score: ${winner_username} ${score_winner} - ${loser_username} ${score_loser}</p>
            <button id="back-to-lobby">Back to Lobby</button>
        `;
        document.body.appendChild(finalScreen);
        document.getElementById("back-to-lobby").addEventListener("click", () => {
            document.body.removeChild(finalScreen);
            this.navigateTo("/play-menu");
        });
    }

    checkStart(){
        // console.log(this.socketService);
        if (this.socketService.isplaying){
            document.querySelector("canvas.webgl").innerText = "Playing...";
            this.listenToKeyboard();
            window.addEventListener("keyboard", () => this.listenToKeyboard());
        }
    }

    listenToKeyboard() {
        // console.log("Listening to keyboard")
        if (this.socketService.isplaying){

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
            // console.error("Error in mount():", error);
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

