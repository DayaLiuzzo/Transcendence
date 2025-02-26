import BaseView from './BaseView.js';

export default class PlayMenu extends BaseView{
    constructor(params){
        super(params);
    }

    showError(message){
        alert(message);
    }


    render(){
        return `
        <div>
            <h2>Play Menu</h2>
            
            <a href='/play-local'><button onclick>Play localy</button><\a>
            <br>
            <a href='/play-remote'><button onclick>Play remote</button><\a>
            <br>
            <a href='/play-tournament'><button onclick>Play in tournament</button><\a>
            <br>
            <a href='/play-with-friends'><button onclick>Play with your friends</button><\a>
        </div>
    `;
    }

    // async attachEvents(){
    //     console.log('Evnts attached ({Play-Menu})');
    // }
}
//element click, fonction fleche navigate to (from le router) avec en parametre le path hrefe