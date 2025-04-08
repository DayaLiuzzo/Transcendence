import BaseView from './BaseView.js';

export default class PlayTournamentCreate extends BaseView{

    constructor(params){
        super(params);
        this.handleCreateTournamentSubmit = this.handleCreateTournamentSubmit.bind(this);
    }

    validateInputs(formData){
        if (!formData.name || formData.name.length < 3) return "Tournament name must be at least 3 characters long.";
        if (formData.name.length > 32) return "Tournament name must be at most 32 characters long.";
        return null;
    }

    handleCreateTournamentSubmit(event){
        event.preventDefault();
        const formData = this.getFormData();
        this.createTournament(formData);
    }


    async createTournament(formData) {
        const errorMessage = this.validateInputs(formData);
        if (errorMessage){ return this.showError(errorMessage); }

        if (errorMessage){ return this.customAlert(errorMessage); }

        const createTournamentResponse = await this.sendPostRequest(this.API_URL_TOURNAMENT + 'create_tournament/', formData);
        if (!createTournamentResponse.success){ return this.customAlert(createTournamentResponse.error); }

        //add alerte avant redirection??
        this.navigateTo("/my-tournament");
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
            name: document.getElementById("createTournament-name").value,
            max_users: document.getElementById("createTournament-maxuser").value,
        };
    }


    getErrorContainer() {
        let errorContainer = document.getElementById("createTournament-error-container");

        if (!errorContainer) {
            errorContainer = document.createElement("div");
            errorContainer.id = "createTournament-error-container";  // Set a unique ID
            errorContainer.classList.add("error-container");  // Optional: Add a class for styling
            document.getElementById("create-tournament-form").insertBefore(errorContainer, document.getElementById("create-tournament-form").firstChild); // Insert at the top of the form
        }

        return errorContainer;
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
            <h2>Create a new tournament</h2>
            <form id="create-tournament-form" hidden>
                <input type="text" id="createTournament-name" placeholder="Tournament name" required>
                <input type="number" min="3" max="32" id="createTournament-maxuser" placeholder="Maximum number of users in tournament" required>
                <button type="submit">Create a tournament</button>
            </form>
            <div id="tournament-create-field"></div>

            <button id="tournament-mine-button" hidden>See my tournament page</button>

        </div>

    `;
    }

    async mount() {

        try {
            const checkIfInTournament = await this.sendGetRequest(this.API_URL_TOURNAMENT + 'is_in_tournament/');
            if (checkIfInTournament.success) {
                if (checkIfInTournament.data.in_tournament){

                    // return this.navigateTo('/my-tournament')
                    document.getElementById("tournament-mine-button").removeAttribute("hidden");
                    document.getElementById("tournament-create-field").innerText = "You cannot create a tournament since you are already part of one";
                    return;
                }
                document.getElementById("create-tournament-form").removeAttribute("hidden");

                }
            }
        catch (error) {
            // console.error("Error in mount():", error);
        }
    }

    unmount(){

        document.getElementById("create-tournament-form")?.removeEventListener("submit", this.handleCreateTournamentSubmit);

        const tournamentSeeMineField = document.getElementById("tournament-mine-button");
        if (tournamentSeeMineField) {
            tournamentSeeMineField.removeEventListener("click", this.handleMyTournamentClick);
        }

    }

    attachEvents(){

        document.getElementById("create-tournament-form")?.addEventListener("submit", this.handleCreateTournamentSubmit);

        const tournamentSeeMineField = document.getElementById("tournament-mine-button");
        if (tournamentSeeMineField) {
            tournamentSeeMineField.addEventListener("click", this.handleMyTournamentClick.bind(this));
        }


    }

}
