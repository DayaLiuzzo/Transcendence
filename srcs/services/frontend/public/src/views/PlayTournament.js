import BasePlayView from './BasePlayView.js';

export default class PlayTournament extends BasePlayView{
    constructor(params){
        super(params);
    }

    render(){
        return `
        <div>
            <h2>Play Tournament</h2>
            
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
