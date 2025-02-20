// tester si remplacer localhost:4430 par '' fonctionne au sein des fetch;


export default class BaseView{
    constructor(router, params = {}){
        this.router = router
        this.params = params;
        this.API_URL = 'https://localhost:4430/api/auth/';
        this.API_URL_SIGNUP = 'https://localhost:4430/api/auth/signup/';
        this.API_URL_ROOMS = 'https://localhost:4430/api/rooms/';
        this.API_URL_LOGIN = 'https://localhost:4430/api/auth/token/';
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
    async navigateTo(path){
        this.router.navigateTo(path);
    }
    
    async sendPostRequest(url, formData){
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const responseData = await response.json();
            if (!response.ok) {
                console.error("Error in sendPostRequest():", url)
                return { success: false, error: responseData};
            }
            return { success: true, data: responseData};
        } 
        catch (error) {
            console.error("Network Error at ", url);
            return { success: false, error: { message: "Network error"}};
        }
    }

    attachEvents(){
        console.log('Events attached');
    }
}