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

    
    handleJoinTournamentClick(event) {
        if (event.target && event.target.tagName === "BUTTON" && event.target.textContent === "Join") {
            const tournamentId = event.target.getAttribute("data-tournamentID");
            this.joinTournament(tournamentId);
        }
    }
    
    async joinTournament(tournamentId) {
        const body = {};
        const response = await this.sendPostRequest(this.API_URL_TOURNAMENT + "join/" + tournamentId + "/", body);
        if (!response.success) { return this.showError(response.error, "tournament-list-field"); }

        this.navigateTo("/my-tournament");
    }
    
    attachEvents() {
        console.log('Events attached (Tournament list)');

        const tournamentListField = document.getElementById("tournament-list-field");
        if (tournamentListField) {
            tournamentListField.addEventListener("click", this.handleJoinTournamentClick.bind(this));
        }

    }

    getErrorContainer() {
        let errorContainer = document.getElementById("list-tournament-error-container");

        if (!errorContainer) {
            errorContainer = document.createElement("div");
            errorContainer.id = "list-tournament-error-container";  // Set a unique ID
            errorContainer.classList.add("error-container");  // Optional: Add a class for styling
            document.getElementById("tournament-list-field").insertBefore(errorContainer, document.getElementById("tournament-list-field").firstChild);
        }

        return errorContainer;
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
            joinButton.id = "joinButton"
            joinButton.textContent = "Join";
            joinButton.setAttribute("data-tournamentID", tournament.tournament_id);
            tournamentItem.appendChild(joinButton);
            tournamentList.appendChild(tournamentItem);
        });
        tournamentListField.appendChild(tournamentList);
    }
    
    async mount() {
        console.log('Mounting Play tournament List');
        try {
            const getTournamentList = await this.sendGetRequest(this.API_URL_TOURNAMENT + '/list/');
            if (!getTournamentList.success) { return this.showError(response.error, "tournament-list-field"); }
            
            const tournaments = Array.isArray(getTournamentList.data) ? getTournamentList.data : [getTournamentList.data];
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
