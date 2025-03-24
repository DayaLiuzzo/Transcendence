//page faite avec daya

import BaseView from './BaseView.js';


export default class Game extends BaseView{
    constructor(params){
        super(params);
    }

    showError(message){
        this.customAlert(message);
    }

    async fetchRoomInfo(){
        const response = await fetch('https://localhost:4430/api/rooms/test/')
        console.log(response);
        const data = await response.json();
        console.log(data);
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
            <h2>Game</h2>
        </div>
    `;
    }

    attachEvents(){
        this.fetchRoomInfo();
        console.log('Events attached (LogIn)');
    }
}