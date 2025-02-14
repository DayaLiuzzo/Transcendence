export default class BaseView{
    constructor(params = {}){
        this.params = params;
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
            this.attachEvents();
        } 
        catch (error) {
            console.error("Error in mount():", error);
        }
    }
    attachEvents(){
        console.log('Events attached');
    }

}