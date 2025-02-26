//page faite avec daya

import BaseView from './BaseView.js';


export default class Game extends BaseView{
    constructor(params){
        super(params);
    }

    showError(message){
        alert(message);
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
            <h2>Game</h2>
            <h3> please just be ok</h3>
        </div>
    `;
    }

    async attachEvents(){
        this.fetchRoomInfo();
        console.log('Events attached (LogIn)');
    }
}