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



    attachEvents() {
        console.log('Events attached (Tournament list)');


        const tournamentListField = document.getElementById("tournament-list-field");
        // if (tournamentListField) {
        //     tournamentListField.addEventListener("click", this.handleFriendRemoveClick.bind(this));
        // } on va l'utiliser pour join

    }

    renderTournamentList(tournaments) {
        console.log("Coucou!!!!!!!!!")
        const tournamentListField = document.getElementById("tournament-list-field");
        if (!tournamentListField) return;
        console.log("Toujours la!!!!!!!!!")
        tournamentListField.innerHTML = "";
        const tournamentList = document.createElement("ul");
        tournaments.forEach(tournament => {
            const tournamentItem = document.createElement("li");
            console.log(tournament.name);
            tournamentItem.textContent = tournament.name;

            const joinButton = document.createElement("button");
            joinButton.textContent = "Join";
            joinButton.setAttribute("data-tournamentname", tournament.name);
            tournamentItem.appendChild(joinButton);
            tournamentList.appendChild(tournamentItem);
        });
        tournamentListField.appendChild(tournamentList);
    }

    async mount() {
        try {
            const getTournamentList = await this.sendGetRequest(this.API_URL_TOURNAMENT + '/list/');
            if (!getTournamentList.success){
                console.log("Erreur fetch get tournament list")
                return this.showError(getTournamentList.error)
            }
            console.log("Success fetch get tournament list")
            console.log(getTournamentList.data)
            
            const tournaments = Array.isArray(getTournamentList.data) ? getTournamentList.data : [getTournamentList.data];
            console.log("tournament --> ", tournaments)
            this.renderTournamentList(tournaments);
        }
        catch (error) {
            console.error("Error in mount():", error);
        }
    }

    unmount() {
        console.log('Unmounting Profile');
        
        const tournamentListField = document.getElementById("tournament-list-field");
        if (tournamentListField) {
            tournamentListField.removeEventListener("click", this.handleRemoveFriendClick);
        }
    }

}
