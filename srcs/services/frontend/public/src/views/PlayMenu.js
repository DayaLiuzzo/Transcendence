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
                <h2>Play Menu</h2>
                <div class="play-menu">
                    <div class="play-option" id="play-local">Play locally</div>
                    <div class="play-option" id="play-remote">Play remote</div>
                    <div class="play-option" id="play-tournament">Play in tournament</div>
                    <div class="play-option" id="play-with-friends">Play with friends</div>
                </div>
            </div>
        </div>
    `;
    }

    attachEvents(){
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
