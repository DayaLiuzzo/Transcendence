import BaseView from './BaseView.js';
import WebSocketService from './WebSocketService.js';

export default class BasePlayView extends BaseView{
    constructor(params){
        super(params);
        this.socketService = null;
        this.handleGameEnd = this.handleGameEnd.bind(this);
    }

    createContainer(containerName){
        const container = document.createElement("div");
        container.id = containerName;
        return container;
    }

    async loadLogoLumon(){
        fetch("/media/logo/lumonLogo.svg")
        .then(response => response.text())
        .then(svgText => {
          const container = document.getElementById("logoLumon");
          container.innerHTML = svgText;
          const svgElement = container.querySelector('svg');
          const paths = svgElement.querySelectorAll('path');

          paths.forEach(path => {
            path.style.fill = '#b8e6ec';
            path.style.stroke = '#b8e6ec';
        });


          // Ajouter une classe CSS à un élément spécifique
          const globePath = svgElement.querySelector('path[title="Globe"]');
          if (globePath) {
              globePath.classList.add('globe-style');
          }

        //   #b8e6ec
        });
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
                        // console.log(number.innerHTML);
                    }
                    else{
                        // console.log(number.innerHTML);
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

        const logoLumon = document.createElement("div");
        logoLumon.id = "logoLumon"
        logoLumon.alt = "logo";

        this.loadLogoLumon(logoLumon)

        progressBar.innerHTML = "Cold Harbour                                  57% Completed";

        console.log("LOGOLUMON SRC ", logoLumon.src );

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
            document.querySelector("canvas.webgl").innerText = "Loading...";

			if (!this.socketService || !this.socketService.isConnected) {
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
            // console.error("Error in mount():", error);
        }
    }

}

