import BaseView from './BaseView.js';


export default class NotFound extends BaseView{
    constructor(params){
        super(params);
    }

    showError(message){
        this.customAlert(message);
    }

    
    render(){
        return `
        <div id="error">
            <div>
                <h2>⚠️ 404 page not found</h2>
            </div>
        </div>
    `;
    }


    attachEvents(){
        // console.log('Events attached (404)');
    }
}