//status : en cours

import BaseView from './BaseView.js';

export default class PlayTournamentCreate extends BaseView{
    
    constructor(params){
        super(params);
        this.handleCreateTournamentSubmit = this.handleCreateTournamentSubmit.bind(this);
    }
    
    containsSpecialCharacter(password) {
        const regex = /[@#$%^&*!]/; // Check for specific special characters
        return regex.test(password);
    }

    validateInputs(formData){
        if (!formData.name || formData.name.length < 3) return "Tournament name must be at least 3 characters long.";
        if (formData.name.length > 32) return "Tournament name must be at most 32 characters long.";
        //To do : checker que l'input est bien un nb
        // if (!formData.maxuser || formData.password.length < 6) return "Password must be at least 6 characters long.";
        // if (!this.containsSpecialCharacter(formData.password)) return "Password must contain one of the following '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '+', '='";
        return null;
    }

    handleCreateTournamentSubmit(event){
        event.preventDefault();
        const formData = this.getFormData();
        this.createTournament(formData);
    }


    async createTournament(formData) {
        const errorMessage = this.validateInputs(formData);
        if (errorMessage){
            console.log("wrong input!")
            return this.showError(errorMessage);
        }
        console.log("bons input!")
        const createTournamentResponse = await this.sendPostRequest(this.API_URL_TOURNAMENT + 'create_tournament/', formData);
        if (!createTournamentResponse.success){
            console.log("Erreur fetch create tournament")
            return this.showError(createTournamentResponse.error);
        }
        else
        {
            console.log("Succes fetch create tournament")
            console.log(createTournamentResponse.data)
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
            document.getElementById("createTournament-form").insertBefore(errorContainer, document.getElementById("createTournament-form").firstChild); // Insert at the top of the form
        }

        return errorContainer;
    }
    
    render(){
        return `
        <div>
            <h2>Create Tournament (En cours : presque fini)</h2>
            <div id="tournament-name"></div>
            <div id="tournament-max-user"></div>
            <div id="tournament-id"></div>

            
            
            <form id="createTournament-form">
                <input type="text" id="createTournament-name" placeholder="Tournament name" required>
                <input type="text" id="createTournament-maxuser" placeholder="Maximum number of users in tournament" required>
                <button type="submit">Create tournament</button>
            </form>

            <p>gerer les erreurs dinput pour le max user<\p>

        </div>
        
    `;
    }

    unmount(){
        console.log('unmounting create tournament');
        document.getElementById("createTournament-form")?.removeEventListener("submit", this.handleCreateTournamentSubmit);
    }

    attachEvents(){
        console.log('Events attached (create tournament)');
        document.getElementById("createTournament-form")?.addEventListener("submit", this.handleCreateTournamentSubmit);
    }

}
