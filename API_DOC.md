<h1>API documentation</h1>

<h2>Base URL for all API requests:</h2>

https://localhost:4430/api/<service_name>/...

Authentication : The API uses Bearer JWT token Authentication  
Authorization: Bearer your_jwt_token_here

<h2>Summary</h2>

<h3>API Gateway</h3>

<ol>
  <li>/api/api_gateway/</li>
</ol>

<h3>AUTH</h3>

<ol>
  <li>/api/auth/signup/</li>
  <li>/api/auth/login/</li>
  <li>/api/auth/delete/< str:username>/ </li>
  <li>/api/auth/< str:username>/</li>
</ol>

<h3>GAME</h3>

<ol>
  <li>/api/game/</li>
  <li>/api/game/< str:roomname></li>
</ol>

<h3>USERS</h3>

<ol>
  <li>/api/users/delete/< str:username>/</li>
  <li>/api/users/create/</li>
  <li>/api/users/< str:username>/</li>
</ol>

<h2>Example</h2>

<h3>API GATEWAY</h3>

**Service is running**
Endpoint: /api/api_gateway/  
Method: **GET**  
Description: Check if API Gateway service is running.  

<h3>AUTH</h3>

**Sign Up**

Endpoint: /api/auth/signup/  
Method: **POST**  
Description: Registers a new user in the authentication service and its associated data in other services.  
    
***Request Body:***

    {
        "username": "new_user",
        "email": "new_user@example.com",
        "password": "password123"
    }

**Login**

Endpoint: /api/auth/login/  
Method: **POST**  
Description: Authenticates the user and returns a pair of tokens (access token and refresh token).  

***Request Body:***

    {
        "username": "existing_user",
        "password": "password123"
    }

**User**

Endpoint /api/auth/<str:username>  
Method: **GET**   
Description: retrieves data from user  

***Request Body:***
    
    {

    }

***Response:***

    HTTP 200 OK
    {
    "username": "singeuse_pseudo",
    "password": "pbkdf2_sha256$600000$3CfWPrRJOJ5yg3PoSCHd2D$uTjzwM2rgnvGC3MVsgx+Nax7lwxGNP/V8nT4lxRRBQs=",
    "email": "singeuse@gmail.com"
    }

***Error codes:***

    HTTP 404 Not Found

**Delete User (Delete user from the authentication service)**

Endpoint: /api/auth/delete/< str:username>/  
Method: DELETE  
Description: Deletes a user from the authentication service and its associated data in other services.  
**URL Parameters:** username (required) - The username of the user to delete.

***Example Request:***

    DELETE https://localhost:4430/api/auth/delete/john_doe/

<h3>GAME</h3>

**Service running**

Endpoint: /api/game/  
Method: **GET**  
Description: Checks if the game service is working completely.  

<h3>USERS</h3>

**Delete User**

Endpoint: /api/users/delete/< str:username>/  
Method: DELETE  
Description: Deletes a user profile from the user service.  
**URL Parameters:** username (required) - The username of the user whose profile is to be deleted.  

***Example Request:***

    DELETE https://localhost:4430/api/users/delete/john_doe/

**Create User Profile**

Endpoint: /api/users/create/  
Method: **POST**  
Description: Creates a new user profile in the user service.  

***Request Body:***

    {
        "username": "new_user",
        "biography": "biography blabla"
    }
    
***Respone :***

    HTTP 201 Created
    {
        "username": "singeuse",
        "biography": "Default biography"
    }
    
***Error codes:***

    HTTP 400 Bad Request

**User Profile**

Endpoint /api/users/< str:username>  
Method: **GET**  
Description: retrieves data from user_profile  

***Request Body:***

    Authorization Bearer my_jtwt_token
    {
    }
    
***Response:***

    HTTP 200 OK
    {
        "username": "singeuse_pseudo",
        "biography": "Default biography"
    }
    
***Error codes:***

    HTTP 404 Not Found

