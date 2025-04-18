import BaseView from './BaseView.js';

export default class PlayTournamentMine extends BaseView{

    constructor(params){
        super(params);// a remove ??
        this.status = "waiting";
    }

    render(){
        return `
        <div>
            <div id="header">
                <div>
                    <button id="button-nav">
                    <i class="menuIcon material-icons">menu</i>
                    <i class="closeIcon material-icons" style="display: none;" >close</i>
                    </button>
                    <nav id="navbar">
                    </nav>
                </div>
                <div id="line"></div>
                </div>
            </div>
            <h2>My tournament page</h2> <br>
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

                <button id="tournament-leave-button" hidden>Leave</button>
                <div id="tournament-leave-field"></div>

                <button id="tournament-launch-button" hidden>Launch</button>
                <div id="tournament-launch-field"></div>

                <button id="tournament-delete-button" hidden>Delete</button>
                <div id="tournament-delete-field"></div>
            </div>

            <div id ="no-tournament" hidden>You are currently not part of any tournament. <br>
                <button id="tournament-create-button">Create a new tournament</button>
                <button id="tournament-join-button">Join an available tournament with its ID</button>
                <button id="tournament-list-button">List available tournaments you can join</button>
            </div>

            <div id ="tournament-launched" hidden>Tournament started
                <button id="access-waiting-rooms-button">Access waiting room</button>
            </div>
            `;
        }

    /* Events et events attachement */

    // Create tournament
    async createTournament() {
        const body = {};

        //add alerte avant redirection??
        this.navigateTo("/create-tournament");
    }

    handleCreateTournamentClick(event) {
        if (event.target && event.target.tagName === "BUTTON" && event.target.textContent === "Create a new tournament") {
            this.createTournament();
        }
    }

    // Join tournament
    async joinTournament() {
        const body = {};

        //add alerte avant redirection??
        this.navigateTo("/join-tournament");
    }

    handleJoinTournamentClick(event) {
        if (event.target && event.target.tagName === "BUTTON" && event.target.textContent === "Join an available tournament with its ID") {
            this.joinTournament();
        }
    }

    // Liste tournament
    async listTournament() {
        const body = {};

        //add alerte avant redirection??
        this.navigateTo("/list-tournament");
    }

    handleListTournamentClick(event) {
        if (event.target && event.target.tagName === "BUTTON" && event.target.textContent === "List available tournaments you can join") {
            this.listTournament();
        }
    }

    // Leave tournament
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

    // Delete tournament
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

    // Launch tournament
    async launchTournament() {
        const body = {};
        const response = await this.sendPostRequest(this.API_URL_TOURNAMENT + "launch/", body);
        if (!response.success) { return this.showError(response.error, "tournament-launch-field");}
        this.status = "playing";
		this.handleStatusChange(this.status)

        //add alerte avant refresh??
        // this.navigateTo("/my-tournament");
    }

    handleLaunchTournamentClick(event) {
        if (event.target && event.target.tagName === "BUTTON" && event.target.textContent === "Launch") {
            this.launchTournament();
        }
    }

    handleStatusChange(newStatus) {


        if (newStatus === 'playing') {
            this.customAlert("Le tournoi est maintenant en cours !");
            document.getElementById("tournament-launched").removeAttribute("hidden");
            document.getElementById("tournament-launch-button").setAttribute("hidden", true);
            document.getElementById("tournament-delete-button").setAttribute("hidden", true);
            document.getElementById("tournament-leave-button").setAttribute("hidden", true);
            document.getElementById("tournament-info").setAttribute("hidden", true);
        }
    }


    // Acces waiting rooms tournament
    async waitingRoomTournament() {
        //add alerte avant redirection??
        this.navigateTo("/play-remote-tournament");
    }

    handleWaitingRoomTournamentClick(event) {
        if (event.target && event.target.tagName === "BUTTON" && event.target.textContent === "Access waiting room") {
            this.waitingRoomTournament();
        }
    }

    attachEvents() {


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

        const tournamentCreateField = document.getElementById("tournament-create-button");
        if (tournamentCreateField) {
            tournamentCreateField.addEventListener("click", this.handleCreateTournamentClick.bind(this));
        }

        const tournamentJoinField = document.getElementById("tournament-join-button");
        if (tournamentJoinField) {
            tournamentJoinField.addEventListener("click", this.handleJoinTournamentClick.bind(this));
        }

        const tournamentListField = document.getElementById("tournament-list-button");
        if (tournamentListField) {
            tournamentListField.addEventListener("click", this.handleListTournamentClick.bind(this));
        }

        const tournamentWaitingRoomField = document.getElementById("access-waiting-rooms-button");
        if (tournamentWaitingRoomField) {
            tournamentWaitingRoomField.addEventListener("click", this.handleWaitingRoomTournamentClick.bind(this));
        }

    }

    formatField(type, value){
        // if (!value) return "No information available.";
        if (!value) return `${type.charAt(0).toUpperCase() + type.slice(1)}: No information available.`;

        const formats = {
            name: (val) => `Tournament's name: ${val}`,
            id: (val) => `Tournament ID: ${val}`,
            owner: (val) => `Tournament owner: ${val}`,
            users: (val) => `Users: ${val}`,
            users_count: (val) => `Current number of users: ${val}`,
            max_users: (val) => `Maximum number of users allowed in this tournament: ${val}`,
            status: (val) => `Status: ${val}`,
            winner: (val) => `Winner: ${val}`,
        };

        // return formats[type] ? formats[type](value) : value;
        return formats[type] ? formats[type](value) : `${type.charAt(0).toUpperCase() + type.slice(1)}: ${value}`;

    }

    async renderTournamentInfo(){
        const checkIfInTournament = await this.sendGetRequest(this.API_URL_TOURNAMENT + 'is_in_tournament/');
            if (checkIfInTournament.success) {
                    if (!checkIfInTournament.data.in_tournament){
                        document.getElementById("no-tournament").removeAttribute("hidden");
                        this.router.customClearInterval(this.router.RerenderTournamentInterval);
                        document.getElementById("tournament-info").setAttribute("hidden", true);
                        // alert("The Host Terminated the party");
                        // return this.navigateTo('/play-menu');

                    }
                }

                const getTournamentInfo = await this.sendGetRequest(this.API_URL_TOURNAMENT + 'my_tournament/');
                if (!getTournamentInfo.success) {
                    // return this.navigateTo('/play-menu');
                    return this.router.customClearInterval(this.router.RerenderTournamentInterval);
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

                if (tournamentStatus === "playing"){
                    this.status = "playing"
                    document.getElementById("tournament-launched").removeAttribute("hidden");
                    document.getElementById("tournament-info").setAttribute("hidden", true);
                }

                if (this.status === "waiting")
                    document.getElementById("tournament-info").removeAttribute("hidden");

                if (this.status === "waiting" && tournamentOwner != this.getUsername())
                    document.getElementById("tournament-leave-button").removeAttribute("hidden");

                if (this.status === "waiting" && tournamentOwner === this.getUsername()){
                    document.getElementById("tournament-delete-button").removeAttribute("hidden");
                    document.getElementById("tournament-launch-button").removeAttribute("hidden");
                }

                const tournamentWinner= getTournamentInfo.data.winner;
                document.getElementById("tournament-winner").innerHTML = this.formatField('winner', tournamentWinner);

    }

    async mount() {
        // console.log('Mounting Play tournament Mine');

        try {
            this.renderTournamentInfo()
            this.router.RerenderTournamentInterval = setInterval(() => {this.renderTournamentInfo();}, 5000);
        }
        catch (error) {
            // console.error("Error in mount():", error);
        }
    }

    unmount() {


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

        const tournamentCreateField = document.getElementById("tournament-create-button");
        if (tournamentCreateField) {
            tournamentCreateField.removeEventListener("click", this.handleCreateTournamentClick);
        }

        const tournamentJoinField = document.getElementById("tournament-join-button");
        if (tournamentJoinField) {
            tournamentJoinField.removeEventListener("click", this.handleJoinTournamentClick);
        }

        const tournamentListField = document.getElementById("tournament-list-button");
        if (tournamentListField) {
            tournamentListField.removeEventListener("click", this.handleListTournamentClick);
        }

        const tournamentWaitingRoomField = document.getElementById("access-waiting-rooms-button");
        if (tournamentWaitingRoomField) {
            tournamentWaitingRoomField.removeEventListener("click", this.handleWaitingRoomTournamentClick);
        }
        this.router.customClearInterval(this.router.RerenderTournamentInterval);
    }
}
