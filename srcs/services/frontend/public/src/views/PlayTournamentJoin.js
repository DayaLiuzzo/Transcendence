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
    
    async seeMyTournament() {
        const body = {};

        //add alerte avant redirection??
        this.navigateTo("/my-tournament");
    }
    
    handleMyTournamentClick(event) {
        if (event.target && event.target.tagName === "BUTTON" && event.target.textContent === "See my tournament page") {
            this.seeMyTournament();
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
            <h2>Join a tournament with its ID</h2>
            <form id="join-tournament-form" hidden>
                <input type="text" id="joinTournament-id" placeholder="Tournament ID" required>
                <button type="submit">Join this tournament</button>
            </form>
            <div id="tournament-join-field"></div>

            <button id="tournament-mine-button" hidden>See my tournament page</button>

        </div>
    `;
    }

    async mount() {
        // console.log('Mounting Play tournament Join');

        try {
            const checkIfInTournament = await this.sendGetRequest(this.API_URL_TOURNAMENT + 'is_in_tournament/');
            if (checkIfInTournament.success) {
                if (checkIfInTournament.data.in_tournament) {
                    // return this.navigateTo('/my-tournament')
                    document.getElementById("tournament-mine-button").removeAttribute("hidden"); 
                    document.getElementById("tournament-join-field").innerText = "You cannot join a tournament since you are already part of one"; 

                    return;
                }
                
                document.getElementById("join-tournament-form").removeAttribute("hidden");
                }
            }
        catch (error) {
            console.error("Error in mount():", error);
        }
    }

    unmount(){
        // console.log('unmounting join tournament');
        document.getElementById("join-tournament-form")?.removeEventListener("submit", this.handleJoinTournamentSubmit);
   
        const tournamentSeeMineField = document.getElementById("tournament-mine-button");
        if (tournamentSeeMineField) {
            tournamentSeeMineField.removeEventListener("click", this.handleMyTournamentClick);
        }
    }

    attachEvents(){
        // console.log('Events attached (join tournament)');
        document.getElementById("join-tournament-form")?.addEventListener("submit", this.handleJoinTournamentSubmit);
    
        
        const tournamentSeeMineField = document.getElementById("tournament-mine-button");
        if (tournamentSeeMineField) {
            tournamentSeeMineField.addEventListener("click", this.handleMyTournamentClick.bind(this));
        }

        
    }

}
