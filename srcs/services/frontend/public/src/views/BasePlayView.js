import BaseView from './BaseView.js';

export default class BasePlayView extends BaseView{
    constructor(params){
        super(params);
    }

    showError(message){
        alert(message);
    }

    async joinRoom() {
        const result = await this.sendPostRequest(this.API_URL_ROOMS + 'join_room/', {});
        if (result.success) {
            document.getElementById("room-id").innerText = result.data.room_id;
            document.getElementById("user-1").innerText = this.getUsername();
            document.getElementById("user-2").innerText = "Looking for opponent...";
        } else {
            document.getElementById("room-id").innerText = "No room found, please reload";
        }
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
            this.app.innerHTML = await this.render();
            await this.joinRoom();
            // this.updateNavbar();
            await this.attachEvents();
        } catch (error) {
            console.error("Error in mount():", error);
        }
    }   
}