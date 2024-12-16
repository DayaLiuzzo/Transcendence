Base URL for all API requests:

https://localhost:4430/api/<service_name>/...

Authentication :

The API uses Bearer JWT token Authentication
Authorization: Bearer your_jwt_token_here

AUTH

/api/auth/signup/
/api/auth/login/ 
/api/auth/delete/<str:username>/ 

USERS

/api/users/delete/<str:username>/ 
/api/users/create/ 


AUTH

    Sign Up
    Endpoint: /api/auth/signup/
    Method: POST
    Description: Registers a new user in the authentication service and its associated data in other services.
    Request Body: 
    {
        "username": "new_user",
        "email": "new_user@example.com",
        "password": "password123"
    }

    Login
    Endpoint: /api/auth/login/
    Method: POST
    Description: Authenticates the user and returns a pair of tokens (access token and refresh token).
    Request Body:
    {
        "username": "existing_user",
        "password": "password123"
    }

    Delete User (Delete user from the authentication service)
    Endpoint: /api/auth/delete/<str:username>/
    Method: DELETE
    Description: Deletes a user from the authentication service and its associated data in other services.
    URL Parameters:
        username (required): The username of the user to delete.
    Example Request:
        DELETE https://localhost:4430/api/auth/delete/john_doe/


USERS

    Delete User  
    Endpoint: /api/users/delete/<str:username>/
    Method: DELETE
    Description: Deletes a user profile from the user service.
    URL Parameters:
        username (required): The username of the user whose profile is to be deleted.
    Example Request:
        DELETE https://localhost:4430/api/users/delete/john_doe/


    Create User Profile 
    Endpoint: /api/users/create/
    Method: POST
    Description: Creates a new user profile in the user service.
    Request Body:
    {
        "username": "new_user",
        "biography": "biography blabla"
    }

    <!-- Details 
    Endpoint /api/users/details/<str:username>
    Method: GET 
    Description: retrieves data from user_profile
    Request Body:
    Authorization Bearer my_jtwt_token
    {
    } -->
