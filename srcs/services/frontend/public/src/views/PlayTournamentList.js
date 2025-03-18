//status : pas pret !!!

import BaseView from './BaseView.js';

export default class PlayTournamentList extends BaseView{
    
    constructor(router, params) {
        super(router, params);
    }


    render() {
        return `
        <div>
            <h2>List tournament</h2>

            <div id="tournament-list-field"></div>
        </div>
        `;
    }

    async joinTournament(tournamentId) {
        const body = {};
        const response = await this.sendPostRequest(this.API_URL_TOURNAMENT + "join/" + tournamentId + "/", body);
        if (!response.success) {
            console.log("error join tournament")
            this.showError(response.error);
            return;
        }
        else
            console.log("Fetch pour join le tournoi a marche")
        this.navigateTo("/my-tournament");
    }

    handleJoinTournamentClick(event) {
        if (event.target && event.target.tagName === "BUTTON" && event.target.textContent === "Join") {
            const tournamentId = event.target.getAttribute("data-tournamentID");
            this.joinTournament(tournamentId);
        }
    }

    attachEvents() {
        console.log('Events attached (Tournament list)');


        const tournamentListField = document.getElementById("tournament-list-field");
        if (tournamentListField) {
            tournamentListField.addEventListener("click", this.handleJoinTournamentClick.bind(this));
        }

    }

    renderTournamentList(tournaments) {
        const tournamentListField = document.getElementById("tournament-list-field");
        if (!tournamentListField) return;
        tournamentListField.innerHTML = "";
        const tournamentList = document.createElement("ul");
        tournaments.forEach(tournament => {
            const tournamentItem = document.createElement("li");
            tournamentItem.textContent = tournament.name;
            const joinButton = document.createElement("button");
            joinButton.textContent = "Join";
            joinButton.setAttribute("data-tournamentID", tournament.tournament_id);
            tournamentItem.appendChild(joinButton);
            tournamentList.appendChild(tournamentItem);
        });
        tournamentListField.appendChild(tournamentList);
    }
    
tournament_id
    async mount() {
        console.log('Mounting Play tournament List');
        try {
            const getTournamentList = await this.sendGetRequest(this.API_URL_TOURNAMENT + '/list/');
            if (!getTournamentList.success){
                console.log("Erreur fetch get tournament list")
                return
            }
            console.log("Success fetch get tournament list")
            console.log(getTournamentList.data)
            
            const tournaments = Array.isArray(getTournamentList.data) ? getTournamentList.data : [getTournamentList.data];
            console.log("tournament --> ", tournaments)
            console.log('Mounting Play tournament List success');
            this.renderTournamentList(tournaments);

        }
        catch (error) {
            console.error("Error in mount():", error);
        }
    }

    unmount() {
        console.log('Unmounting Play tournament List');
        
        const tournamentListField = document.getElementById("tournament-list-field");
        if (tournamentListField) {
            tournamentListField.removeEventListener("click", this.handleJoinTournamentClick);
        }
    }

}
