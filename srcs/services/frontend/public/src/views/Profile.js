import BaseView from './BaseView.js';

export default class Profile extends BaseView {
    constructor(router, params) {
        super(router, params);
    }

    async getStats(){
        const username = this.getUsername();
        const response = await this.sendGetRequest(this.API_URL_USERS + username + '/');
        if (response.success){
            return response.data;
        }
        return null;
    }

    getErrorContainer() {
        let errorContainer = document.getElementById("add-friend-error-container");

        if (!errorContainer) {
            errorContainer = document.createElement("div");
            errorContainer.id = "add-friend-error-container";  // Set a unique ID
            errorContainer.classList.add("error-container");  // Optional: Add a class for styling
            document.getElementById("add-friend-form").insertBefore(errorContainer, document.getElementById("add-friend-form").firstChild); // Insert at the top of the form
        }
        return errorContainer;
    }

    render() {
        return `
        <div>
            <div id="header">
                <div>
                    <button id="button-nav">
                    <i class="menuIcon material-icons">menu</i>
                    <i class="closeIcon material-icons" style="display: none;" >close</i>
                    </button>
                    <nav id="navbar">
                    </nav>
                </div>
                <div id="line"></div>
                </div>
            </div>
            <div id="container">
                <div id="container-profile">
                    <h2>Profile</h2>
                    <div id="container-button">
                        <i class="fas fa-edit" id="edit-profile" title="Edit Profile"></i>
                        <i class="fas fa-sign-out-alt" id="logout" title="Logout"></i>
                    </div>
                </div>
                <div id="username-field">
                </div>
                <div id="biography-field"></div>
                <div id="friends-field"></div>
                <form id="add-friend-form">
                    <input type="text" id="friend-username" placeholder="Enter friend's username">
                    <button type="submit">Add Friend</button>
                </form>
                <div id="stats-field"></div>
                <div id="match-history-field">"Match History"</div>
            <button id="refresh">Refresh</button>
            </div>
        </div>
        `;
    }

    async updateMatchHistoryField(){
        const matchHistoryField = document.getElementById("match-history-field");
        if(!matchHistoryField){
            console.log('No match history field');
            return;
        }
        const response = await this.sendGetRequest(this.API_URL_ROOMS + 'list_my_finished_rooms/');
        if(response.success){
            const username = this.getUsername();
            response.data.forEach((match, index) => {
                let you_id;
                let you_username;
                let opponent_id;
                let opponent_username;
                let winner;
                let you_score;
                let opponent_score;
                let matchElement = document.createElement('div');
                matchElement.classList.add('match-history-item');
                matchElement.id = `matchHistory${index + 1}`;

                if(match.player1_username === username){
                    you_id = match.player1;
                    you_score = match.score_player1;
                    you_username = match.player1_username;
                    opponent_id = match.player2;
                    opponent_username = match.player2_username;
                    opponent_score = match.score_player2;
                }
                else{
                    you_id = match.player2;
                    you_username = match.player2_username;
                    you_score = match.score_player2;
                    opponent_id = match.player1;
                    opponent_username = match.player1_username;
                    opponent_score = match.score_player1;
                }
                if(match.winner = you_id){
                    winner = you_username;
                }
                else{
                    winner = opponent_username;
                }
                match.player1_username === username 
                matchElement.innerHTML = `
                <h3>Game number ${index + 1}</h3>
                <p>you: ${you_username}</p>
                <p>opponent: ${opponent_username}</p>
                <p>winner: ${winner}</p>
                <p>you score: ${you_score}</p>
                <p>opponent score: ${opponent_score}</p>
                
                `;
                matchHistoryField.appendChild(matchElement);
            });
        }
        else {
        console.log('No match history found');
            matchHistoryField.innerHTML = `
                <h3>game {default} history</h3>
                <p>username: default</p>
                <p>personnal score: default</p>
                <p>opp username: default</p>
                <p>opp score: default</p>
                <p>Draws: default</p>
                <p>date: default</p>
                `;
        }
    }

    async updateStatsField() {
        const statsField = document.getElementById("stats-field");
        if (!statsField){
            console.log('No stats field');
            return;
        }
        const username = this.getUsername();
        const response = await this.sendGetRequest(this.API_URL_USERS + username + '/');
        if(response.success){
            statsField.innerHTML = `
            <h3>Stats</h3>
            <p>Wins: ${response.data.wins}</p>
            <p>Losses: ${response.data.losses}</p>
            `;

        }
        else {
        statsField.innerHTML = `
        <h3>Stats</h3>
        <p>Wins: Default</p>
        <p>Losses: Default</p>
        `;
        }
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
            newFriendItem.classList.add("friend-item");
            newFriendItem.textContent = friendUsername;

            const users = Array.isArray(userFriends.data) ? userFriends.data : [userFriends.data];
            
            const isConnected = this.sendGetRequest(this.API_URL_USERS + 'status/' + friendUsername + '/')
            const statusIndicator = document.createElement("span");
            statusIndicator.classList.add("status-indicator");
            if (isConnected) {
                statusIndicator.textContent = "connected";
                statusIndicator.classList.add("connected");
            } else {
                statusIndicator.textContent = "disconnected";
                statusIndicator.classList.add("disconnected");
            }

            const removeButton = document.createElement("button");
            removeButton.textContent = "Remove";
            removeButton.setAttribute("data-username", friendUsername);
            removeButton.classList.add("remove-button");

            
            newFriendItem.appendChild(statusIndicator);
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

    handleMatchHistoryClick() {
        this.navigateTo('/match-history');
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
    
    handleRefreshClick() {
        this.refreshToken();
    }

    attachEvents() {
        console.log('Events attached (Profile)');
        const refreshButton = document.getElementById("refresh");
        if (refreshButton) {
            refreshButton.addEventListener("click", this.handleRefreshClick.bind(this));
        }
        const editProfileButton = document.getElementById("edit-profile");
        if (editProfileButton) {
            editProfileButton.addEventListener("click", this.handleEditProfileClick.bind(this));
        }

        const matchHistoryButton = document.getElementById("match-history");
        if (matchHistoryButton) {
            matchHistoryButton.addEventListener("click", this.handleMatchHistoryClick.bind(this));
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
            // chaque nom user
            const friendItem = document.createElement("li");
            friendItem.classList.add("friend-item");

            const usernameSpan = document.createElement("span");
            usernameSpan.textContent = user.username;
            usernameSpan.classList.add("username");

            const statusIndicator = document.createElement("span");
            statusIndicator.classList.add("status-indicator");
            if (user.is_online) {
                statusIndicator.textContent = "connected";
                statusIndicator.classList.add("connected");
            } else {
                statusIndicator.textContent = "disconnected";
                statusIndicator.classList.add("disconnected");
            }

            const removeButton = document.createElement("button");
            removeButton.textContent = "Remove";
            // ce que va supprimer le remove
            removeButton.setAttribute("data-username", user.username);
            removeButton.classList.add("remove-button");

            friendItem.appendChild(usernameSpan);
            friendItem.appendChild(statusIndicator);
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

            const avatarUrl = await this.displayAvatar();
            const container = document.createElement("div");
            container.classList.add("username-container");

            const avatarImg = document.createElement("img");
            avatarImg.src = avatarUrl;
            avatarImg.alt = "User Avatar";
            avatarImg.classList.add("avatar-img");

            const textContainer = document.createElement("div");
            textContainer.innerHTML = this.formatField("username", username);
            textContainer.classList.add("username-text");

            container.appendChild(avatarImg);
            container.appendChild(textContainer);

            document.getElementById("username-field").appendChild(container);
            this.updateStatsField();
            this.updateMatchHistoryField();
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
