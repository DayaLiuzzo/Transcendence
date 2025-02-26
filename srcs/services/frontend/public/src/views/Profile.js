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
        return `
        <div>
            <h2>Profile</h2>
            <h3> please just be ok</h3>
            <div id="username-field"></div>
            <div id="biography-field"></div>
            <div id="friends-field"></div>
            <form id="add-friend-form">
            <input type="text" id="friend-username" placeholder="Enter friend's username">
                <button type="submit">Add Friend</button>
            </form>
            <button id="edit-profile">Edit Profile</button>
            <button id="logout">Logout</button>

        </div>
    `;
    }

    async addFriend(friendUsername){
        const username = this.getUsername();
        const body = {}
        if (username === friendUsername){
            this.showError("You cannot add yourself as a friend");
            return
        }
        const response = await this.sendPatchRequest(this.API_URL_USERS + username + "/friends/add/" + friendUsername + "/", body);
        if(!response.success){
            this.showError(response.error?.detail || response.error?.message);
            return;
        }
        const friendsField = document.getElementById("friends-field");
        if(friendsField){
        const newFriendItem = document.createElement("li");
        newFriendItem.textContent = friendUsername;
        const users = Array.isArray(userFriends.data) ? userFriends.data : [userFriends.data];

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.setAttribute("data-username", friendUsername);

        newFriendItem.appendChild(removeButton);
        friendsField.querySelector("ul").appendChild(newFriendItem);
        }
        alert(response.data.message);
    }

    async removeFriend(friendUsername, friendItem){
        const username = this.getUsername();
        const body = {}
        if (username === friendUsername){
            this.showError("You cannot add yourself as a friend");
            return
        }
        const response = await this.sendDeleteRequest(this.API_URL_USERS + username + "/friends/remove/" + friendUsername + "/", body);
        if(!response.success)
        {
            this.showError(response.error.detail);
            return;
        }
        friendItem.remove();


        alert(response.data.message);

    }

    async attachEvents(){
        console.log('Events attached (Profile)');
        const editProfileButton = document.getElementById("edit-profile");
        if (editProfileButton) {
            editProfileButton.addEventListener("click", async () => {
                this.navigateTo('/edit-profile');
            });
        }
        document.getElementById("add-friend-form").addEventListener("submit", (event) => {
            event.preventDefault();
            const friendUsername = document.getElementById("friend-username").value;
            this.addFriend(friendUsername);
        });

        document.getElementById("friends-field").addEventListener("click", (event) => {
            if (event.target && event.target.tagName === "BUTTON" && event.target.textContent === "Remove") {
                const friendUsername = event.target.getAttribute("data-username");
                const friendItem = event.target.parentElement;
                this.removeFriend(friendUsername, friendItem); 
            }
        });

        const logout = document.getElementById("logout");
        if (logout) {
            logout.addEventListener("click", async () => {
                this.logout();
            });
        }
    }

    renderFriends(users){
        const friendsField = document.getElementById("friends-field");
        if (!friendsField) return;
        friendsField.innerHTML = "";
        const friendsList = document.createElement("ul");
        users.forEach(user => {
            const friendItem = document.createElement("li");
            friendItem.textContent = user.username;

            const removeButton = document.createElement("button");
            removeButton.textContent = "Remove";
            removeButton.setAttribute("data-username", user.username);
            friendItem.appendChild(removeButton);
            friendsList.appendChild(friendItem);

        });
        friendsField.appendChild(friendsList);
    }

    async mount(){
        try {
            this.app.innerHTML = await this.render();
            const username = this.getUsername();
            const userData = await this.sendGetRequest(this.API_URL_USERS + username + '/');
            const biography = userData.data.biography;
            const userFriends = await this.sendGetRequest(this.API_URL_USERS + username + '/friends/');
            const users = Array.isArray(userFriends.data) ? userFriends.data : [userFriends.data];
            this.renderFriends(users);
            this.updateFieldContent("username-field", this.formatField("username", username));
            this.updateFieldContent("biography-field", this.formatField("biography", biography));
            await this.updateNavbar();
            await this.attachEvents();
        }
        catch (error) {
            console.error("Error in mount():", error);
        }
    }
}



