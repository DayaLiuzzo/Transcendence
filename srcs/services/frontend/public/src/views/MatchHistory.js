import BaseView from './BaseView.js';


export default class SignUp extends BaseView{
    constructor(router, params){
        super(router, params);

    }
    getErrorContainer() {
        let errorContainer = document.getElementById("matchHistory-error-container");

        if (!errorContainer) {
            errorContainer = document.createElement("div");
            errorContainer.id = "matchHistory-error-container";
            errorContainer.classList.add("error-container"); 
            document.getElementById("match-history-field").insertBefore(errorContainer, document.getElementById("match-history-field").firstChild); 
        }

        return errorContainer;
    }

    render(){
        return `
        <div>
            <h2>Match History</h2>
            <div id="match-history-field"></div>

        </div>
    `;
    }

    async updateMatchHistoryField(){
        const matchHistoryField = document.getElementById("match-history-field");
        if(!matchHistoryField){
            console.log('No match history field');
            return;
        }
        const response = await this.sendGetRequest(this.API_URL_ROOMS + 'list_my_finished_rooms/');
        if(response.success){
            console.log('Match history found');
            console.log(response.data);
            console.log(response.data[0]['room_id']);
            const username = this.getUsername();
            response.data.forEach((match, index) => {
                let you_id;
                let you_username;
                let opponent_id;
                let opponent_username;
                let winner;
                let you_score;
                let opponent_score;
                let matchElement = document.createElement('div');
                matchElement.classList.add('match-history-item');
                matchElement.id = `matchHistory${index + 1}`;

                if(match.player1_username === username){
                    you_id = match.player1;
                    you_score = match.score_player1;
                    you_username = match.player1_username;
                    opponent_id = match.player2;
                    opponent_username = match.player2_username;
                    opponent_score = match.score_player2;
                }
                else{
                    you_id = match.player2;
                    you_username = match.player2_username;
                    you_score = match.score_player2;
                    opponent_id = match.player1;
                    opponent_username = match.player1_username;
                    opponent_score = match.score_player1;
                }
                if(match.winner = you_id){
                    winner = you_username;
                }
                else{
                    winner = opponent_username;
                }
                match.player1_username === username 
                matchElement.innerHTML = `
                <h3>Game number ${index + 1}</h3>
                <p>you: ${you_username}</p>
                <p>opponent: ${opponent_username}</p>
                <p>winner: ${winner}</p>
                <p>you score: ${you_score}</p>
                <p>opponent score: ${opponent_score}</p>
                
                `;
                matchHistoryField.appendChild(matchElement);
            });
        }
        else {
        console.log('No match history found');
            matchHistoryField.innerHTML = `
                <h3>game {default} history</h3>
                <p>username: default</p>
                <p>personnal score: default</p>
                <p>opp username: default</p>
                <p>opp score: default</p>
                <p>Draws: default</p>
                <p>date: default</p>
                `;
        }
    }

    async mount(){
        console.log('mounting matchHistory');
        this.updateMatchHistoryField();
    }

    unmount(){
        console.log('unmounting matchHistory');
    }

    attachEvents(){
        console.log('Events attached (matchHistory)');
    }


}