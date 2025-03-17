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
            <h2>404 Error</h2>
            <h3> this page doesn't exist </h3>
            <div id="error-404">
                <p> please gtfo <3 </p>
            </div>
        </div>
    `;
    }

    attachEvents(){
        console.log('Events attached (404)');
    }
}
