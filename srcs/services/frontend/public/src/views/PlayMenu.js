import BaseView from './BaseView.js';

export default class PlayMenu extends BaseView{
    constructor(params){
        super(params);
    }

    showError(message){
        alert(message);
    }


    async render(){
        return `
        <div>
            <h2>Play Menu</h2>
            <
            <h3>Play local</h3>
            <h3>Play remote</h3>
            <h3>Play in tournament</h3>
            <h3>Play with your friends</h3>
            <a href='/play-alone'><button onclick>Play alone</button><\a>

        </div>
    `;
    }

    async attachEvents(){
        console.log('Events attached ({Play-Menu})');
        document.getElementById("login-form").addEventListener("submit", this.login);
    }
}
//element click, fonction fleche navigate to (from le router) avec en parametre le path href