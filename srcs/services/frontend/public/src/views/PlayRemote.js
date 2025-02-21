import BaseView from './BaseView.js';

export default class PlayRemote extends BaseView{
    constructor(params){
        super(params);
    }

    showError(message){
        alert(message);
    }

    async handleJoinRoom() {
        const result = await this.sendPostRequest(this.API_URL + 'join_room/', {}); // Envoie une requête POST vide
        if (result.success) {
            document.getElementById("response-result").innerText = "Success: " + JSON.stringify(result.data, null, 2);
        } else {
            document.getElementById("response-result").innerText = "Error: " + JSON.stringify(result.error, null, 2);
        }
    }

    async render(){
        return `
        <div>
            <h2>Play remote</h2>
            
            <ol>
                <li>Pop-up loader "Looking for playroom</li>
                <li>Integrer les call api pour trouver un room</li>
                <li>Integrer les websockets</li>
                <li>Intgrer la 3d</li>
            </ol>
            <div id="response-result"></div>      
        </div>
    `;
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
