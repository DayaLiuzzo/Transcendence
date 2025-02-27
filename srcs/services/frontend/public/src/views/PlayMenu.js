import BaseView from './BaseView.js';

export default class PlayMenu extends BaseView{
    constructor(params){
        super(params);
    }

    showError(message){
        alert(message);
    }


    render(){
        return `
        <div>
            <h2>Play Menu</h2>

            <button id="play-local">Play localy</button>
            <br>
            <button id="play-remote">Play remote</button>
            <br>
            <button id="play-tournament">Play in tournament</button>
            <br>
            <button id="play-with-friends">Play in tournament</button>
        </div>
    `;
    }

    async attachEvents(){
        console.log('Events attached (Play-Menu)');

        const playLocalButton = document.getElementById("play-local");
        if (playLocalButton) {
            playLocalButton.addEventListener("click", async () => {
                this.navigateTo('/play-local');
            });
        }

        const playRemoteButton = document.getElementById("play-remote");
        if (playRemoteButton) {
            playRemoteButton.addEventListener("click", async () => {
                this.navigateTo('/play-remote');
            });
        }

        const playTournamentButton = document.getElementById("play-tournament");
        if (playTournamentButton) {
            playTournamentButton.addEventListener("click", async () => {
                this.navigateTo('/play-tournament');
            });
        }

        const playWithFriendsButton = document.getElementById("play-with-friends");
        if (playWithFriendsButton) {
            playWithFriendsButton.addEventListener("click", async () => {
                this.navigateTo('/play-with-friends');
            });
        }
    }
}
