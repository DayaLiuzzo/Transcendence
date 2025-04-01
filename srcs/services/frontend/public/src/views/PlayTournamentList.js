import BaseView from './BaseView.js';

export default class PlayTournamentList extends BaseView{
    
    constructor(router, params) {
        super(router, params);
    }


    render() {
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
            <h2>Available tournaments</h2>
            <br> 
            <div id="tournament-list-field"></div>
            <div id ="no-tournament" hidden>Unfortunately, there is no tournament available for the moment.<br>
            <button id="tournament-create-button">Create a new tournament</button>
            </div>
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
        if (!response.success) { return this.customAlert(response.error); }

        //add alerte avant redirection??
        this.navigateTo("/my-tournament");
    }
    
    
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

    attachEvents() {
        // console.log('Events attached (Tournament list)');

        const tournamentListField = document.getElementById("tournament-list-field");
        if (tournamentListField) {
            tournamentListField.addEventListener("click", this.handleJoinTournamentClick.bind(this));
        }
    
        const tournamentCreateMineField = document.getElementById("tournament-create-button");
        if (tournamentCreateMineField) {
            tournamentCreateMineField.addEventListener("click", this.handleCreateTournamentClick.bind(this));
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

    renderTournamentList(tournaments, userIsIntournament) {
        const tournamentListField = document.getElementById("tournament-list-field");
        if (!tournamentListField) return;
        if (!tournaments.length){
            // tournamentListField.innerHTML = "No available tournament";
            document.getElementById("no-tournament").removeAttribute("hidden");
            // rediriger vers create tournament 
            return;
        }
        // console.log("User in tournament? ", userIsIntournament);
        tournamentListField.innerHTML = "";
        const tournamentList = document.createElement("ul");
        tournaments.forEach(tournament => {
            const tournamentItem = document.createElement("li");
            tournamentItem.textContent = tournament.name;
            if (!userIsIntournament){
                const joinButton = document.createElement("button");
                joinButton.id = "joinButton"
                joinButton.textContent = "Join";
                joinButton.setAttribute("data-tournamentID", tournament.tournament_id);
                joinButton.classList.add("joinButton");
                
                tournamentItem.innerHTML += "&nbsp;&nbsp;";

                tournamentItem.appendChild(joinButton);
            }
            tournamentList.appendChild(tournamentItem);
        });
        tournamentListField.appendChild(tournamentList);
    }

    async mount() {
        // console.log('Mounting Play tournament List');
        try {
            const getTournamentList = await this.sendGetRequest(this.API_URL_TOURNAMENT + '/list/waiting/');
            if (!getTournamentList.success) { return this.customAlert(response.error); }
            
            const tournaments = Array.isArray(getTournamentList.data) ? getTournamentList.data : [getTournamentList.data];
            
            const checkIfInTournament = await this.sendGetRequest(this.API_URL_TOURNAMENT + 'is_in_tournament/');
            let userIsIntournament = false;
            if (checkIfInTournament.success) {
                if (checkIfInTournament.data.in_tournament){
                    userIsIntournament = true;
                } 
            }
            else
                return;
            this.renderTournamentList(tournaments, userIsIntournament);
        }
        catch (error) {
            // console.error("Error in mount():", error);
        }
    }

    unmount() {
        // console.log('Unmounting Play tournament List');
        
        const tournamentListField = document.getElementById("tournament-list-field");
        if (tournamentListField) {
            tournamentListField.removeEventListener("click", this.handleJoinTournamentClick);
        }

        const tournamentCreateMineField = document.getElementById("tournament-create-button");
        if (tournamentCreateMineField) {
            tournamentCreateMineField.removeEventListener("click", this.handleCreateTournamentClick);
        }

    }

}
