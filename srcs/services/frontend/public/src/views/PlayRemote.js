import BasePlayView from './BasePlayView.js';

export default class PlayRemote extends BasePlayView{
    constructor(params){
        super(params);
    }

    showError(message){
        alert(message);
    }
    
    async handleJoinRoom() {
        const result = await this.sendPostRequest(this.API_URL_ROOMS + 'join_room/', {});
        if (result.success) {
            document.getElementById("response-result").innerText = "You are affected in " + result.data.room_id;
        } else {
            document.getElementById("response-result").innerText = "Unaible finding a room, try again";
        }
    }

    render(){
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
}
