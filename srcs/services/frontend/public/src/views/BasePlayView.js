import BaseView from './BaseView.js';

export default class BasePlayView extends BaseView{
    constructor(params){
        super(params);
    }

    showError(message){
        alert(message);
    }

    async handleJoinRoom() {
        const result = await this.sendPostRequest(this.API_URL_ROOMS + 'join_room/', {});
        if (result.success) {
            document.getElementById("response-result").innerText = "Success: " + JSON.stringify(result.data, null, 2);
        } else {
            document.getElementById("response-result").innerText = "Error: " + JSON.stringify(result.error, null, 2);
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
            await this.handleJoinRoom();
        } catch (error) {
            console.error("Error in mount():", error);
        }
    }   
}