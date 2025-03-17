import BaseView from './BaseView.js';


export default class NotFound extends BaseView{
    constructor(params){
        super(params);
    }

    showError(message){
        alert(message);
    }

    
    render(){
        return `
        <div>
            <h2>404 biiiitch</h2>
            <h3> please gtfo</h3>
        </div>
    `;
    }


    attachEvents(){
        console.log('Events attached (404)');
    }
}