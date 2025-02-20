import BaseView from './BaseView.js';

export default class PlayRemote extends BaseView{
    constructor(params){
        super(params);
    }

    showError(message){
        alert(message);
    }


    async render(){
        return `
        <div>
            <h2>Play remote</h2>
            
            <ol>
                <li>Integrer les call api</li>
                <li>Integrer les websockets</li>
                <li>Intgrer la 3d</li>

            </ol>
           
        </div>
    `;
    }


}
