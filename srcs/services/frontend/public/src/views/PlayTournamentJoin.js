//status : pas pret !!!

import BaseView from './BaseView.js';

export default class PlayTournamentJoin extends BaseView{
    
    constructor(params){
        super(params);
        this.handleJoinTournamentSubmit = this.handleJoinTournamentSubmit.bind(this);

    }
    
    //inputs a valider ou pas ?


    handleJoinTournamentSubmit(event){
        event.preventDefault();
        const formData = this.getFormData();
        this.joinTournament(formData.id);
    }

    async joinTournament(tournamentId) {
        const body = {};

        const response = await this.sendPostRequest(this.API_URL_TOURNAMENT + "join/" + tournamentId + "/", body);
        if (!response.success) { return this.showError(response.error, "tournament-join-field"); }

        this.navigateTo("/my-tournament");
    }
    

    getFormData(){
        return {
            id: document.getElementById("joinTournament-id").value,
        };
    }

    render(){
        return `
        <div>
            <h2>Join Tournament (Pas pret !!!!)</h2>
            <form id="joinTournament-form">
                <input type="text" id="joinTournament-id" placeholder="Tournament id" required>
                <button type="submit">Join tournament</button>
            </form>
            <div id="tournament-join-field"></div>
        </div>
    `;
    }

    unmount(){
        console.log('unmounting join tournament');
        document.getElementById("joinTournament-form")?.removeEventListener("submit", this.handleJoinTournamentSubmit);
    }

    attachEvents(){
        console.log('Events attached (join tournament)');
        document.getElementById("joinTournament-form")?.addEventListener("submit", this.handleJoinTournamentSubmit);
    }

}
