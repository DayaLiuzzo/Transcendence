import BaseView from './BaseView.js';

export default class PlayTournament extends BaseView{
    constructor(params){
        super(params);
    }

    showError(message){
        alert(message);
    }


    async render(){
        return `
        <div>
            <h2>Play Tournament</h2>
            
            <ol>
                <li>Integrer les call api</li>
                <li>Integrer les websockets</li>
                <li>Intgrer la 3d</li>
            </ol>
           
        </div>
    `;
    }

}
