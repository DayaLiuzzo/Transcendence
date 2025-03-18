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
            <button id="tournament-leave-button">Leave</button>
            <div id="tournament-leave-field"></div>
            <h4>Pour le owner<h4>
            <button id="tournament-launch-button">Launch</button>
            <div id="tournament-launch-field"></div>
            <button id="tournament-delete-button">Delete</button>
            <div id="tournament-delete-field"></div>            
           
            `;
        }
        // <h4>Pour tous les user<h4>
        // <button id="tournament-play-field">Play tournament</button>
        
        // <p>[ ] lister les current match et y acceder ??<\p>
        // <p>[ ] voir les resultats??<\p>
        // <br>
        // </div>
    
    //pour leave tournament
    async leaveTournament() {
        const body = {};
        const response = await this.sendPostRequest(this.API_URL_TOURNAMENT + "leave/", body);
        if (!response.success) {
            console.log("error leave tournament")
            this.showError(response.error, "tournament-leave-field");
            return;
        }
        else
            console.log("Fetch pour leave le tournoi a marche")
        this.navigateTo("/play-tournament");
    }
    
    handleLeaveTournamentClick(event) {
        if (event.target && event.target.tagName === "BUTTON" && event.target.textContent === "Leave") {
            this.leaveTournament();
        }
    }

    //pour delete tournament
    async deleteTournament() {
        const body = {};
        const response = await this.sendDeleteRequest(this.API_URL_TOURNAMENT + "delete_tournament/", body);
        if (!response.success) {
            console.log("error delete tournament")
            this.showError(response.error, "tournament-delete-field");
            return;
        }
        else
            console.log("Fetch pour delete le tournoi a marche")
            this.navigateTo("/play-tournament");
        }
    
    handleDeleteTournamentClick(event) {
        if (event.target && event.target.tagName === "BUTTON" && event.target.textContent === "Delete") {
            this.deleteTournament();
        }
    }

        //pour launch tournament
        async launchTournament() {
            const body = {};
            const response = await this.sendPostRequest(this.API_URL_TOURNAMENT + "launch/", body);
            if (!response.success) {
                console.log("error launch tournament")
                this.showError(response.error, "tournament-launch-field");
                return;
            }
            else
                console.log("Fetch pour launch le tournoi a marche")
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

    // renderTournamentList(tournaments) {
    //     const tournamentListField = document.getElementById("tournament-leave-button");
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

            /* C'est pas du debug, c'est pour afficher les donnes du tournoi en cours */
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
            
            const tournamentStatus = getTournamentInfo.data.status;
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
