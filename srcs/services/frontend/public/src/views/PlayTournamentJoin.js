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

        
       const body = {"tournament_id": tournamentId}
       const checkIfTournamentExists = await this.sendPostRequest(this.API_URL_TOURNAMENT + 'tournament_exists/', body);
       if (checkIfTournamentExists.success) {
            if (!checkIfTournamentExists.data.exists) {
                this.showError("Invalid tournament ID, please retry", "tournament-join-field"); 
                return
            }
    
            const response = await this.sendPostRequest(this.API_URL_TOURNAMENT + "join/" + tournamentId + "/", {});
            if (!response.success) { return this.showError(response.error, "tournament-join-field"); }
    
            this.navigateTo("/my-tournament");
        }
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
            <p>!!!To do : lier levent du bouton pour see my page!!!<\p>

            <form id="joinTournament-form" hidden>
                <input type="text" id="joinTournament-id" placeholder="Tournament id" required>
                <button type="submit">Join tournament</button>
            </form>
            <div id="tournament-join-field"></div>

            <button id="tournament-mine-button" hidden>See my tournament page</button>

        </div>
    `;
    }

    async mount() {
        console.log('Mounting Play tournament Join');

        try {
            const checkIfInTournament = await this.sendGetRequest(this.API_URL_TOURNAMENT + 'is_in_tournament/');
            if (checkIfInTournament.success) {
                if (checkIfInTournament.data.in_tournament) {
                    // return this.navigateTo('/my-tournament')
                    document.getElementById("tournament-mine-button").removeAttribute("hidden"); 
                    document.getElementById("tournament-join-field").innerText = "You cannot join a tournament since you are already part of one"; 

                    return;
                }
                
                document.getElementById("joinTournament-form").removeAttribute("hidden");
                }
            }
        catch (error) {
            console.error("Error in mount():", error);
        }
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
