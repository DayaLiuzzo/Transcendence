//status : pas pret !!!

import BaseView from './BaseView.js';

export default class PlayTournamentMine extends BaseView{
    
    constructor(params){
        super(params);
    }
    
    render(){
        return `
        <div>
            <h2>Play Tournament Mine (Pas pret !!!)</h2>

            <br>
            <div id="tournament-info"></div>
            <div id="tournament-name"></div>
            <div id="tournament-id"></div>
            <div id="tournament-owner"></div>
            <div id="tournament-users-list"></div>
            <div id="tournament-users-nb-current"></div>
            <div id="tournament-users-nb-max"></div>
            <div id="tournament-status"></div>
            <div id="tournament-winner"></div>
            <br>

            <h2>Afficher les infos du tournoi</h2>
            <p>[x] Call get endpoint my tournament<\p>
            <p>[x] Detailler donnees de get endpoint my tournament<\p>
            <p>[ ] Mieux formater les donnees<\p>
            <p>[ ] Boucle pour update check si new user<\p>
            <br>

            <h2>Actions du tournoi</h2>
            <p>[ ] button leave<\p>
            <p>[ ] button delete tournament (pour le owner + voir comment on gere si le tournoi est lance<\p>
            <p>[ ] button start tournament (pour le owner + voir comment on gere si le tournoi est plein, il est lance automatiquement<\p>
            <p>[ ] lister les current match et y acceder ?<\p>
            <p>[ ] voir les resultats<\p>
        </div>
    `;
    }
    
    // async joinTournament(tournamentId) {
    //     const body = {};
    //     const response = await this.sendPostRequest(this.API_URL_TOURNAMENT + "join/" + tournamentId + "/", body);
    //     if (!response.success) {
    //         console.log("error join tournament")
    //         this.showError(response.error);
    //         return;
    //     }
    //     else
    //         console.log("Fetch pour join le tournoi a marche")
    //     this.navigateTo("/my-tournament");
    // }

    // handleJoinTournamentClick(event) {
    //     if (event.target && event.target.tagName === "BUTTON" && event.target.textContent === "Join") {
    //         const tournamentId = event.target.getAttribute("data-tournamentID");
    //         this.joinTournament(tournamentId);
    //     }
    // }

    // attachEvents() {
    //     console.log('Events attached (Tournament Mine)');


    //     const tournamentListField = document.getElementById("tournament-list-field");
    //     if (tournamentListField) {
    //         tournamentListField.addEventListener("click", this.handleJoinTournamentClick.bind(this));
    //     }

    // }

    // renderTournamentList(tournaments) {
    //     const tournamentListField = document.getElementById("tournament-list-field");
    //     if (!tournamentListField) return;
    //     tournamentListField.innerHTML = "";
    //     const tournamentList = document.createElement("ul");
    //     tournaments.forEach(tournament => {
    //         const tournamentItem = document.createElement("li");
    //         tournamentItem.textContent = tournament.name;
    //         const joinButton = document.createElement("button");
    //         joinButton.textContent = "Join";
    //         joinButton.setAttribute("data-tournamentID", tournament.tournament_id);
    //         tournamentItem.appendChild(joinButton);
    //         tournamentList.appendChild(tournamentItem);
    //     });
    //     tournamentListField.appendChild(tournamentList);
    // }

    
    formatField(type, value){
        // if (!value) return "No information available.";
        if (!value) return `${type.charAt(0).toUpperCase() + type.slice(1)}: No information available.`; 

        const formats = {
            name: (val) => `Tournament Name: ${val}`,
            id: (val) => `Tournament ID: ${val}`,
            owner: (val) => `Tournament Owner: ${val}`,
            users: (val) => `Users: ${val}`,
            users_count: (val) => `Current Users: ${val}`,
            max_users: (val) => `Max Users: ${val}`,
            status: (val) => `Status: ${val}`,
            winner: (val) => `Winner: ${val}`,
        };

        // return formats[type] ? formats[type](value) : value;
        return formats[type] ? formats[type](value) : `${type.charAt(0).toUpperCase() + type.slice(1)}: ${value}`;

    }
    
    async mount() {
        console.log('Mounting Play tournament Mine');

        try {
            const getTournamentInfo = await this.sendGetRequest(this.API_URL_TOURNAMENT + 'my_tournament/');
            if (!getTournamentInfo.success){
                console.log("Erreur fetch get tournament list")
                return
            }
            console.log("Success fetch get tournament info")
            // console.log(getTournamentInfo.data)

            console.log('Mounting Play tournament Mine success');

            const tournamentName = getTournamentInfo.data.name;
            // document.getElementById("tournament-name").innerText = tournamentName;
            document.getElementById("tournament-name").innerHTML = this.formatField('name', tournamentName);

            const tournamentID = getTournamentInfo.data.tournament_id;
            // document.getElementById("tournament-id").innerText = tournamentID;
            document.getElementById("tournament-id").innerHTML = this.formatField('id', tournamentID);
           
            const tournamentOwner = getTournamentInfo.data.owner;
            // document.getElementById("tournament-owner").innerText = tournamentOwner;
            document.getElementById("tournament-owner").innerHTML = this.formatField('owner', tournamentOwner);

            const tournamentUsersList = getTournamentInfo.data.users;
            // document.getElementById("tournament-users-list").innerText = tournamentUsersList;
            document.getElementById("tournament-users-list").innerHTML = this.formatField('users', tournamentUsersList);
            
            const tournamentUsersNbCurrent = getTournamentInfo.data.users_count;
            // document.getElementById("tournament-users-nb-current").innerText = tournamentUsersNbCurrent;
            document.getElementById("tournament-users-nb-current").innerHTML = this.formatField('users_count', tournamentUsersNbCurrent);
            
            const tournamentUsersNbMax = getTournamentInfo.data.max_users;
            // document.getElementById("tournament-users-nb-max").innerText = tournamentUsersNbMax;
            document.getElementById("tournament-users-nb-max").innerHTML = this.formatField('max_users', tournamentUsersNbMax);
            
            const tournamentStatus = getTournamentInfo.data.name;
            // document.getElementById("tournament-status").innerText = tournamentStatus;
            document.getElementById("tournament-status").innerHTML = this.formatField('status', tournamentStatus);
            
            const tournamentWinner= getTournamentInfo.data.winner;
            // document.getElementById("tournament-winner").innerText = tournamentWinner;
            document.getElementById("tournament-winner").innerHTML = this.formatField('winner', tournamentWinner);

        }
        catch (error) {
            console.error("Error in mount():", error);
        }
    }

    unmount() {
        console.log('Unmounting Profile');
        
        // const tournamentListField = document.getElementById("tournament-list-field");
        // if (tournamentListField) {
        //     tournamentListField.removeEventListener("click", this.handleRemoveFriendClick);
        // }
    }
}
