//status : pas pret !!!

import BaseView from './BaseView.js';

export default class PlayTournamentMine extends BaseView{
    
    constructor(params){
        super(params);
    }
    
    render(){
        return `
        <div>
            <h2>My tournament (En cours !!!)</h2>

            <div id="tournament-info" hidden>
            <h3>Tournament information</h3>
                <div id="tournament-name"></div>
                <div id="tournament-id"></div>
                <div id="tournament-owner"></div>
                <div id="tournament-users-list"></div>
                <div id="tournament-users-nb-current"></div>
                <div id="tournament-users-nb-max"></div>
                <div id="tournament-status"></div>
                <div id="tournament-winner"></div>
                <p>[ ] Boucle pour update check si new user<\p>
                
                <h3>Actions du tournoi</h3>
                <h4>Pour le user lambda<h4>
                
                <p>(not owner + status = waiting)<\p>
                <button id="tournament-leave-button" hidden>Leave</button>
                <div id="tournament-leave-field"></div>

                <h4>Pour le owner<h4>
                
                <p>(owner + status = waiting)<\p>
                <button id="tournament-launch-button" hidden>Launch</button>
                <div id="tournament-launch-field"></div>
                
                <p>(owner + status = waiting)<\p>
                <button id="tournament-delete-button" hidden>Delete</button>
                <div id="tournament-delete-field"></div>            
            </div>

            <div id ="no-tournament" hidden>You are not part of any tournament
                <p>Button : create a tournament page (A lier !!)<\p>
                <button id="tournament-create-button">Create</button>
                <p>Button : join a tournament page (A lier !!)<\p>
                <button id="tournament-join-button">Join</button>
            </div>

           
            `;
        }
        // <h4>Pour tous les user<h4>
        // <button id="tournament-play-field">Play tournament</button>
        
        // <p>[ ] lister les current match et y acceder ??<\p>
        // <p>[ ] voir les resultats??<\p>
        // <br>
        // </div>
    

    

    async leaveTournament() {
        const body = {};
        const response = await this.sendPostRequest(this.API_URL_TOURNAMENT + "leave/", body);
        if (!response.success) {return this.showError(response.error, "tournament-leave-field");}

        //add alerte avant redirection??
        this.navigateTo("/play-tournament");
    }
    
    handleLeaveTournamentClick(event) {
        if (event.target && event.target.tagName === "BUTTON" && event.target.textContent === "Leave") {
            this.leaveTournament();
        }
    }

    async deleteTournament() {
        const body = {};
        const response = await this.sendDeleteRequest(this.API_URL_TOURNAMENT + "delete_tournament/", body);
        if (!response.success) {return this.showError(response.error, "tournament-delete-field"); }
        
        //add alerte avant redirection??
        this.navigateTo("/play-tournament");
    }
    
    handleDeleteTournamentClick(event) {
        if (event.target && event.target.tagName === "BUTTON" && event.target.textContent === "Delete") {
            this.deleteTournament();
        }
    }

        async launchTournament() {
            const body = {};
            const response = await this.sendPostRequest(this.API_URL_TOURNAMENT + "launch/", body);
            if (!response.success) {return this.showError(response.error, "tournament-launch-field");}
            
            //add alerte avant redirection??
            // this.navigateTo("/play-tournament"); refresh?
        }
        
        handleLaunchTournamentClick(event) {
            if (event.target && event.target.tagName === "BUTTON" && event.target.textContent === "Launch") {
                this.launchTournament();
            }
        }

    attachEvents() {
        console.log('Events attached (Tournament Mine)');

        const tournamentLeaveField = document.getElementById("tournament-leave-button");
        if (tournamentLeaveField) {
            tournamentLeaveField.addEventListener("click", this.handleLeaveTournamentClick.bind(this));
        }

        const tournamentLaunchField = document.getElementById("tournament-launch-button");
        if (tournamentLaunchField) {
            tournamentLaunchField.addEventListener("click", this.handleLaunchTournamentClick.bind(this));
        }

        const tournamentDeleteField = document.getElementById("tournament-delete-button");
        if (tournamentDeleteField) {
            tournamentDeleteField.addEventListener("click", this.handleDeleteTournamentClick.bind(this));
        }
    }

    
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

            const checkIfInTournament = await this.sendGetRequest(this.API_URL_TOURNAMENT + 'is_in_tournament/');
            if (checkIfInTournament.success) {
                    if (!checkIfInTournament.data.in_tournament){ 
                        document.getElementById("no-tournament").removeAttribute("hidden");
                        return;
                    }
                }

            const getTournamentInfo = await this.sendGetRequest(this.API_URL_TOURNAMENT + 'my_tournament/');
            if (!getTournamentInfo.success) {
                return ;
            }

            /* C'est pas du debug, c'est pour afficher les donnes du tournoi en cours */
            const tournamentName = getTournamentInfo.data.name;
            document.getElementById("tournament-name").innerHTML = this.formatField('name', tournamentName);

            const tournamentID = getTournamentInfo.data.tournament_id;
            document.getElementById("tournament-id").innerHTML = this.formatField('id', tournamentID);
           
            const tournamentOwner = getTournamentInfo.data.owner;
            document.getElementById("tournament-owner").innerHTML = this.formatField('owner', tournamentOwner);

            const tournamentUsersList = getTournamentInfo.data.users;
            document.getElementById("tournament-users-list").innerHTML = this.formatField('users', tournamentUsersList);
            
            const tournamentUsersNbCurrent = getTournamentInfo.data.users_count;
            document.getElementById("tournament-users-nb-current").innerHTML = this.formatField('users_count', tournamentUsersNbCurrent);
            
            const tournamentUsersNbMax = getTournamentInfo.data.max_users;
            document.getElementById("tournament-users-nb-max").innerHTML = this.formatField('max_users', tournamentUsersNbMax);
            
            const tournamentStatus = getTournamentInfo.data.status;
            document.getElementById("tournament-status").innerHTML = this.formatField('status', tournamentStatus);
            if (tournamentStatus === "waiting")// add not owner
                document.getElementById("tournament-leave-button").removeAttribute("hidden");
            
            if (tournamentStatus === "waiting"){// add  owner
                document.getElementById("tournament-delete-button").removeAttribute("hidden");
                document.getElementById("tournament-launch-button").removeAttribute("hidden");
            }

            const tournamentWinner= getTournamentInfo.data.winner;
            document.getElementById("tournament-winner").innerHTML = this.formatField('winner', tournamentWinner);
            
            document.getElementById("tournament-info").removeAttribute("hidden");

        }
        catch (error) {
            console.error("Error in mount():", error);
        }
    }

    unmount() {
        console.log('Unmounting Profile');
        
        const tournamentLeaveField = document.getElementById("tournament-leave-button");
        if (tournamentLeaveField) {
            tournamentLeaveField.removeEventListener("click", this.handleLeaveTournamentClick);
        }

        const tournamentLaunchField = document.getElementById("tournament-launch-button");
        if (tournamentLaunchField) {
            tournamentLaunchField.removeEventListener("click", this.handleLaunchTournamentClick);
        }


        const tournamentDeleteField = document.getElementById("tournament-delete-button");
        if (tournamentDeleteField) {
            tournamentDeleteField.removeEventListener("click", this.handleDeleteTournamentClick);
        }
    }
}
