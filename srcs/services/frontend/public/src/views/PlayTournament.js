import BaseView from './BaseView.js';

export default class PlayMenu extends BaseView{

    constructor(params){
        super(params);

        this.createTournamentFunction = async () => {
            await this.navigateTo('/create-tournament');
        }
        this.joinTournamentFunction = async () => {
            await this.navigateTo('/join-tournament');
        }
        this.listTournamentFunction = async () => {
            await this.navigateTo('/list-tournament');
        }
        this.myTournamentFunction = async () => {
            await this.navigateTo('/my-tournament');
        }
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
            <div id="container">
                <h2>Play Tournament Menu</h2>
                <div class="tournament-menu">
                    <div class="tournament-option" id="create-tournament-button">Create a new tournament</div>
                    <div class="tournament-option" id="join-tournament-button">Join a tournament with ID</div>
                    <div class="tournament-option" id="list-tournament-button">List available tournaments</div>
                    <div class="tournament-option" id="my-tournament-button">See my tournament page</div>
                </div>
            </div>
        </div>
    `;
    }

    attachEvents(){
        const createTournamentButton = document.getElementById("create-tournament-button");
        if (createTournamentButton) {
            createTournamentButton.addEventListener("click", this.createTournamentFunction);
        }

        const joinTournamentButton = document.getElementById("join-tournament-button");
        if (joinTournamentButton) {
            joinTournamentButton.addEventListener("click", this.joinTournamentFunction);
        }

        const listTournamentButton = document.getElementById("list-tournament-button");
        if (listTournamentButton) {
            // console.log("listTournamentButton CLICK CREATED");
            listTournamentButton.addEventListener("click", this.listTournamentFunction);
        }

        const myTournamentButton = document.getElementById("my-tournament-button");
        if (myTournamentButton) {
            myTournamentButton.addEventListener("click", this.myTournamentFunction);
        }

    }
    
    unmount(){
        const createTournamentButton = document.getElementById("create-tournament-button");
        if (createTournamentButton) {
            createTournamentButton.removeEventListener("click", this.createTournamentFunction);
        }

        const joinTournamentButton = document.getElementById("join-tournament-button");
        if (joinTournamentButton) {
            joinTournamentButton.removeEventListener("click", this.joinTournamentFunction);
        }

        const listTournamentButton = document.getElementById("list-tournament-button");
        if (listTournamentButton) {
            listTournamentButton.removeEventListener("click", this.listTournamentFunction);
        }

        const myTournamentButton = document.getElementById("my-tournament-button");
        if (myTournamentButton) {  
            myTournamentButton.removeEventListener("click", this.myTournamentFunction);
        }
    }

}

