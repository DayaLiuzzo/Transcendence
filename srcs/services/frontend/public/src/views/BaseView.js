export default class BaseView{
    constructor(params = {}){
        this.params = params;
        this.API_URL = 'https://localhost:4430/api/auth/';
        this.API_URL_SIGNUP = 'https://localhost:4430/api/auth/signup/';
        this.API_URL_ROOMS = 'https://localhost:4430/api/rooms/';
        this.app = document.getElementById('app');
        if (!this.app) {
            console.error("Error: Element with id 'app' not found in document");
        }
    }
    async render(){
        return `<div>Base View</div>`;
    }
    async mount(){
        try {
            this.app.innerHTML = await this.render();
            await this.attachEvents();
        } 
        catch (error) {
            console.error("Error in mount():", error);
        }
    }
    attachEvents(){
        console.log('Events attached');
    }

}