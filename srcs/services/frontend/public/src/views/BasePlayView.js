import BaseView from './BaseView.js';
import WebSocketService from './WebSocketService.js';

export default class BasePlayView extends BaseView{
    constructor(params){
        super(params);
        this.socketService = null;
    }

    async joinRoom() {
        const result = await this.sendPostRequest(this.API_URL_ROOMS + 'join_room/', {});
        if (result.success) {
            console.log(result.success)
            console.log(result.data)
            document.getElementById("room-id").innerText = result.data.room_id;
            // document.getElementById("user-1").innerText = this.getUsername();
            document.getElementById("user-2").innerText = "Looking for opponent...";
            document.getElementById("game-canvas").innerText = "Loading...";
            this.openWebSocket(result.data.room_id);
            window.addEventListener("gameStarted", () => this.checkStart());
        } else {
            document.getElementById("room-id").innerText = "No room found, please reload";
        }
    }

    checkStart(){
        console.log(this.socketService);
        if (this.socketService.isplaying){
            document.getElementById("game-canvas").innerText = "Playing...";
        }
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
}