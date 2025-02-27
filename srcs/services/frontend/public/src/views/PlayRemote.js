import BasePlayView from './BasePlayView.js';

export default class PlayRemote extends BasePlayView{
    constructor(params){
        super(params);
    }

    showError(message){
        alert(message);
    }
    
    render(){
        return `
        <div>
            <h2>Play remote</h2>
            <div id="room-id"></div>
            <div id="user-1"></div>
            <div id="user-2"></div>
            <p>ouvrir la websocket</p>
            
        </div>
    `;
    }
}
