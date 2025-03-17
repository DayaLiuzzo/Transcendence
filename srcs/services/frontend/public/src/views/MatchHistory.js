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
        const username = this.getUsername();
        const response = await this.sendGetRequest(this.API_URL_USERS + username + '/' + 'match_history/');
        if(response.success){
            console.log('Match history found');
            for (matches in response.data.matches){
                matchHistoryField.innerHTML += `
                <h3>Match History</h3>
                <p>personnal score: ${matches.personalScore}</p>
                <p>opp score: ${matches.oppScore}</p>
                <p>date: ${matches.date}</p>
                `;
            }
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