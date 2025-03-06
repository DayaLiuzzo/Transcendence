import { cleanUpThree } from '../three/utils.js';
import BaseView from './BaseView.js';

export default class Profile extends BaseView {
    constructor(router, params) {
        super(router, params);
    }

    getErrorContainer(formId) {
        let errorContainer = document.getElementById(formId+ "-error-container");
        
        if (!errorContainer) {
            errorContainer = document.createElement("div");
            errorContainer.id = formId+ "-error-container";  
            errorContainer.classList.add("error-container"); 
            document.getElementById(formId).insertBefore(errorContainer, document.getElementById(formId).firstChild); 
        }
        
        return errorContainer;
    }


    render() {
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

    async addFriend(friendUsername) {
        const username = this.getUsername();
        const userFriends = await this.sendGetRequest(this.API_URL_USERS + username + '/friends/');
        const body = {};
        if (username === friendUsername) {
            this.showError("You cannot add yourself as a friend"), "add-friend-form";
            return;
        }
        const response = await this.sendPatchRequest(this.API_URL_USERS + username + "/friends/add/" + friendUsername + "/", body);
        if (!response.success) {
            this.showError((response.error?.detail || response.error?.message), "add-friend-form");
            return;
        }
        const friendsField = document.getElementById("friends-field");
        if (friendsField) {
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

    async removeFriend(friendUsername, friendItem) {
        const username = this.getUsername();
        const body = {};
        if (username === friendUsername) {
            this.showError("You cannot remove yourself as a friend", "friends-field");
            return;
        }
        const response = await this.sendDeleteRequest(this.API_URL_USERS + username + "/friends/remove/" + friendUsername + "/", body);
        if (!response.success) {
            this.showError(response.error.detail, "friends-field");
            return;
        }
        friendItem.remove();
        alert(response.data.message);
    }

    handleEditProfileClick() {
        this.navigateTo('/edit-profile');
    }

    handleFriendFormSubmit(event) {
        event.preventDefault();
        const friendUsername = document.getElementById("friend-username").value;
        this.addFriend(friendUsername);
    }

    handleFriendRemoveClick(event) {
        if (event.target && event.target.tagName === "BUTTON" && event.target.textContent === "Remove") {
            const friendUsername = event.target.getAttribute("data-username");
            const friendItem = event.target.parentElement;
            this.removeFriend(friendUsername, friendItem); 
        }
    }

    handleLogoutClick() {
        this.logout();
    }

    attachEvents() {
        console.log('Events attached (Profile)');
        const editProfileButton = document.getElementById("edit-profile");
        if (editProfileButton) {
            editProfileButton.addEventListener("click", this.handleEditProfileClick.bind(this));
        }

        const addFriendForm = document.getElementById("add-friend-form");
        if (addFriendForm) {
            addFriendForm.addEventListener("submit", this.handleFriendFormSubmit.bind(this));
        }

        const friendsField = document.getElementById("friends-field");
        if (friendsField) {
            friendsField.addEventListener("click", this.handleFriendRemoveClick.bind(this));
        }

        const logout = document.getElementById("logout");
        if (logout) {
            logout.addEventListener("click", this.handleLogoutClick.bind(this));
        }
    }

    renderFriends(users) {
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

    async mount() {
        try {
            const username = this.getUsername();
            const userFriends = await this.sendGetRequest(this.API_URL_USERS + username + '/friends/');
            const users = Array.isArray(userFriends.data) ? userFriends.data : [userFriends.data];
            this.renderFriends(users);
            this.updateFieldContent("username-field", this.formatField("username", username));
        }
        catch (error) {
            console.error("Error in mount():", error);
        }
    }

    unmount() {
        console.log('Unmounting Profile');
        
        const addFriendForm = document.getElementById("add-friend-form");
        if (addFriendForm) {
            addFriendForm.removeEventListener("submit", this.handleAddFriendSubmit);
        }
    
        const friendsField = document.getElementById("friends-field");
        if (friendsField) {
            friendsField.removeEventListener("click", this.handleRemoveFriendClick);
        }
    
        const editProfileButton = document.getElementById("edit-profile");
        if (editProfileButton) {
            editProfileButton.removeEventListener("click", this.handleEditProfileClick);
        }
    
        const logoutButton = document.getElementById("logout");
        if (logoutButton) {
            logoutButton.removeEventListener("click", this.handleLogoutClick);
        }

    }
    
}
