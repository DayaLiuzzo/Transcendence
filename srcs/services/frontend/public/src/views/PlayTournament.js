//status pret pour integration du css

import BaseView from './BaseView.js';

export default class PlayMenu extends BaseView{
    
    constructor(params){
        super(params);
    }
    
    render(){
        return `
        <div>
            <h2>Play Tournament Menu (pret pour integration du CSS)</h2>
            
            <button id="create-tournament">Create a tournament</button>
            <br>
            <button id="join-tournament">Join a tournament</button>
            <br>
            <button id="list-tournament">List a tournament</button>
            <br>
            <button id="my-tournament">My tournament</button>
            <br>
        </div>
    `;
    }

    attachEvents(){
        console.log('Events attached (Play-Menu)');

        const createTournamentButton = document.getElementById("create-tournament");
        if (createTournamentButton) {
            createTournamentButton.addEventListener("click", async () => {
                this.navigateTo('/create-tournament');
            });
        }

        const joinTournamentButton = document.getElementById("join-tournament");
        if (joinTournamentButton) {
            joinTournamentButton.addEventListener("click", async () => {
                this.navigateTo('/join-tournament');
            });
        }

        const listTournamentButton = document.getElementById("list-tournament");
        if (listTournamentButton) {
            listTournamentButton.addEventListener("click", async () => {
                this.navigateTo('/list-tournament');
            });
        }
        
        const myTournamentButton = document.getElementById("my-tournament");
        if (myTournamentButton) {
            myTournamentButton.addEventListener("click", async () => {
                this.navigateTo('/my-tournament');
            });
        }

        }
    }

