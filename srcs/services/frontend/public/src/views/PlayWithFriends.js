import BasePlayView from './BasePlayView.js';

export default class PlayWithFriends extends BasePlayView{
    constructor(params){
        super(params);
    }

    showError(message){
        alert(message);
    }


    async render(){
        return `
        <div>
            <h2>Play with friends</h2>
            
            <ol>
                <li>Integrer les call api</li>
                <li>Integrer les websockets</li>
                <li>Intgrer la 3d</li>
            </ol>
            <div id="response-result"></div>                 
        </div>
    `;
    }

}
