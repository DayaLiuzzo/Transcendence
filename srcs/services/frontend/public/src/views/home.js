import BaseView from './BaseView.js';


export default class Home extends BaseView{
    constructor(params){
        super(params);
    }
    async render(){
        return `
            <div class="home">
                <h1>Home</h1>
                <p>Welcome to the Home page</p>
            </div>
        `;
    }
    attachEvents(){
        console.log('Events attached (Home)');

    }
}