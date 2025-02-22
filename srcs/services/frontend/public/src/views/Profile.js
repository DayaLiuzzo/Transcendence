import { cleanUpThree } from '../three/utils.js';
import BaseView from './BaseView.js';


export default class Profile extends BaseView{
    constructor(router, params){
        super(router, params);
    }

    showError(message){
        alert(message);
    }

    async Profile(formData) {

    }

    async render(){
        // const username = this.getUsername();
        return `
        <div>
            <h2>Profile</h2>
            <h3> please just be ok</h3>
            <div id="username-field"></div>

        </div>
    `;
    }

    async attachEvents(){
        console.log('Events attached (Profile)');
        // document.getElementById("Profile-form").addEventListener("submit", (event) => {
        //     event.preventDefault();
        //     const formData = this.getFormData();
        //     this.Profile(formData);
        // });
    }



    async mount(){
        try {
            this.app.innerHTML = await this.render();
            const username = this.getUsername();
            console.log(username);
            const usernameField = document.getElementById("username-field")
            // const usernameField = this.app.querySelector("#username-field");
            if (usernameField) {
                console.log("oui");
                usernameField.textContent = `Welcome, ${username}!`;
            }
            this.updateNavbar();
            await this.attachEvents();
        }
        catch (error) {
            console.error("Error in mount():", error);
        }
    }
}
