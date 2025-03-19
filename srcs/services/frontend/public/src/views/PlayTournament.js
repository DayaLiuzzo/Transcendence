//status pret pour integration du css

import BaseView from './BaseView.js';

export default class PlayMenu extends BaseView{
    
    constructor(params){
        super(params);
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
                <div class="play-menu">
                    <div class="play-option" id="create-tournament-button">Create a new tournament</div>
                    <div class="play-option" id="join-tournament-button">Join a tournament with ID</div>
                    <div class="play-option" id="list-tournament-button">List available tournaments</div>
                    <div class="play-option" id="my-tournament-button">See my tournament page</div>
                </div>
            </div>
        </div>
    `;
    }

    attachEvents(){
        console.log('Events attached (Play-Menu)');

        const createTournamentButton = document.getElementById("create-tournament-button");
        if (createTournamentButton) {
            createTournamentButton.addEventListener("click", async () => {
                this.navigateTo('/create-tournament');
            });
        }

        const joinTournamentButton = document.getElementById("join-tournament-button");
        if (joinTournamentButton) {
            joinTournamentButton.addEventListener("click", async () => {
                this.navigateTo('/join-tournament');
            });
        }

        const listTournamentButton = document.getElementById("list-tournament-button");
        if (listTournamentButton) {
            listTournamentButton.addEventListener("click", async () => {
                this.navigateTo('/list-tournament');
            });
        }
        
        const myTournamentButton = document.getElementById("my-tournament-button");
        if (myTournamentButton) {
            myTournamentButton.addEventListener("click", async () => {
                this.navigateTo('/my-tournament');
            });
        }

        }
    }

