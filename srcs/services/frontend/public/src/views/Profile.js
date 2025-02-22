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
        return `
        <div>
            <h2>Profile</h2>
            <h3> please just be ok</h3>
            <div id="username-field"></div>
            <div id="biography-field"></div>
            <button id="edit-profile">Edit Profile</button>

        </div>
    `;
    }

    async attachEvents(){
        console.log('Events attached (Profile)');
        const editProfileButton = document.getElementById("edit-profile");
        if (editProfileButton) {
            editProfileButton.addEventListener("click", async () => {
                this.navigateTo('/edit-profile');
            });
        }
    }

    async mount(){
        try {
            this.app.innerHTML = await this.render();
            const username = this.getUsername();
            const userData = await this.sendGetRequest(this.API_URL_USERS + username + '/');
            console.log(userData.data.biography);
            const biography = userData.data.biography;
            this.updateFieldContent("username-field", this.formatField("username", username));
            this.updateFieldContent("biography-field", this.formatField("biography", biography));
            this.updateNavbar();
            await this.attachEvents();
        } 
        catch (error) {
            console.error("Error in mount():", error);
        }
    }
}



