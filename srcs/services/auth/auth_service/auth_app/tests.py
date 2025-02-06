from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from auth_app.models import Token
from auth_app.serializers import createServiceToken
from auth_app.models import Service
from django.contrib.auth.hashers import make_password
import os
from unittest.mock import patch
from auth_app.models import CustomUser
import random
import string
import jwt
import pyotp

def generate_random_string(length=8):
    # Generate a random string with letters and digits
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

class AuthenticationTestCase(APITestCase):

    def setUp(self):
        microservices = [
            {'service_name': 'auth', 'password': os.getenv('AUTH_PASSWORD')},
            {'service_name': 'users', 'password': os.getenv('USERS_PASSWORD')},
            {'service_name': 'game', 'password': os.getenv('GAME_PASSWORD')},
            {'service_name': 'rooms', 'password': os.getenv('ROOMS_PASSWORD')},
            {'service_name': 'avatar', 'password': os.getenv('AVATAR_PASSWORD')},
        ]
        
        services_to_create = []
        
        for microservice in microservices:
            password = make_password(microservice['password'])
            services_to_create.append(Service(service_name=microservice['service_name'], password=password))
        
        Service.objects.bulk_create(services_to_create)
        
        for service in Service.objects.filter(service_name__in=[m['service_name'] for m in microservices]):
            token = createServiceToken(service)
            Token.objects.create(service_name=service.service_name, token=token)

        self.username = generate_random_string(10)  # Random username with length 10
        self.password = "password123"  # You can use a fixed password or generate a random one too
        self.email = f"{generate_random_string(10)}@example.com"  # Random email
        self.url = reverse('signup')   # Make sure to use your actual sign-up URL
    def test_user_registration(self):
        data = {
            'username': self.username,
            'password': self.password,
            'email': self.email,
        }
        response = self.client.post(self.url, data, format='json')
        
        # Check if user was created
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = get_user_model().objects.get(username=self.username)
        self.assertEqual(user.username, self.username)
        self.assertTrue(user.check_password(self.password))  # Check if password is hashed
        self.assertEqual(user.two_factor_enabled, False)  # By default, 2FA should be off

    @patch('auth_app.views.send_create_requests')  # Mocking external request
    def test_signup_success(self, mock_send_create_requests):
        # Mock the external service calls to return True (simulate success)
        mock_send_create_requests.return_value = True

        # Valid signup data with unique fields
        data = {
            "username": self.username,
            "password": self.password,
            "email": self.email
        }

        # Send POST request to the signup endpoint
        response = self.client.post(self.url, data, format='json')

        # Assert that the user is created and the response is 201
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check that the user exists in the database
        self.assertTrue(CustomUser.objects.filter(username=self.username).exists())

    @patch('auth_app.views.send_create_requests')  # Mocking external request
    def test_signup_failure_due_to_external_request(self, mock_send_create_requests):
        # Mock the external service calls to return False (simulate failure)
        mock_send_create_requests.return_value = False

        # Valid signup data with unique fields
        data = {
            "username": self.username,
            "password": self.password,
            "email": self.email
        }

        # Send POST request to the signup endpoint
        response = self.client.post(self.url, data, format='json')

        # Assert that the response is 400 (Bad Request)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class DeleteUserViewTest(APITestCase):
    def setUp(self):
        microservices = [
            {'service_name': 'auth', 'password': os.getenv('AUTH_PASSWORD')},
            {'service_name': 'users', 'password': os.getenv('USERS_PASSWORD')},
            {'service_name': 'game', 'password': os.getenv('GAME_PASSWORD')},
            {'service_name': 'rooms', 'password': os.getenv('ROOMS_PASSWORD')},
            {'service_name': 'avatar', 'password': os.getenv('AVATAR_PASSWORD')},
        ]
        
        services_to_create = []
        
        for microservice in microservices:
            password = make_password(microservice['password'])
            services_to_create.append(Service(service_name=microservice['service_name'], password=password))
        
        Service.objects.bulk_create(services_to_create)
        
        for service in Service.objects.filter(service_name__in=[m['service_name'] for m in microservices]):
            token = createServiceToken(service)
            Token.objects.create(service_name=service.service_name, token=token)

        self.username = generate_random_string(10)  # Random username with length 10
        self.password = "password123"  # You can use a fixed password or generate a random one too
        self.email = f"{generate_random_string(10)}@example.com"  # Random email
        self.signup_url = reverse('signup')  # Ensure this matches your URL pattern
        self.signup_data = {
            'username': self.username,
            'password': self.password,
            'email': self.email
        }
        # Define the URL for deleting the user
        self.delete_url = reverse('delete', kwargs={'username': self.username})

    def authenticate(self):
        # Helper function to authenticate a user (simulate login)
        response = self.client.post(reverse('token_obtain_pair'), {'username': self.username, 'password': self.password})
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access_token']}")

    @patch('auth_app.views.send_delete_requests')  # Mocking external request
    def test_delete_user_success(self, mock_send_delete_requests):
        # Mock the external service calls to return True (simulate success)
        mock_send_delete_requests.return_value = True

        signup_response = self.client.post(self.signup_url, self.signup_data, format='json')
        if signup_response.status_code != status.HTTP_201_CREATED:
            print("Signup failed:", signup_response.data)  # 
        self.assertEqual(signup_response.status_code, status.HTTP_201_CREATED)  # Ensure signup is successful

        self.authenticate()  # Authenticate the user
        
        # Send DELETE request to delete the user
        response = self.client.delete(self.delete_url)
        
        # Assert that the response is 204 (No Content), meaning deletion was successful
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Assert that the user no longer exists in the database
        self.assertFalse(CustomUser.objects.filter(username=self.username).exists())

    def test_delete_user_unauthorized(self):
        signup_response = self.client.post(self.signup_url, self.signup_data, format='json')
        if signup_response.status_code != status.HTTP_201_CREATED:
            print("Signup failed:", signup_response.data)  # 
        self.assertEqual(signup_response.status_code, status.HTTP_201_CREATED)  # Ensure signup is successful
        # Try to delete a user without authentication
        response = self.client.delete(self.delete_url)
        
        # Assert that the response is 401 (Unauthorized)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class LoginUserViewTest(APITestCase):
    def setUp(self):
        microservices = [
            {'service_name': 'auth', 'password': os.getenv('AUTH_PASSWORD')},
            {'service_name': 'users', 'password': os.getenv('USERS_PASSWORD')},
            {'service_name': 'game', 'password': os.getenv('GAME_PASSWORD')},
            {'service_name': 'rooms', 'password': os.getenv('ROOMS_PASSWORD')},
            {'service_name': 'avatar', 'password': os.getenv('AVATAR_PASSWORD')},
        ]
        
        services_to_create = []
        
        for microservice in microservices:
            password = make_password(microservice['password'])
            services_to_create.append(Service(service_name=microservice['service_name'], password=password))
        
        Service.objects.bulk_create(services_to_create)
        
        for service in Service.objects.filter(service_name__in=[m['service_name'] for m in microservices]):
            token = createServiceToken(service)
            Token.objects.create(service_name=service.service_name, token=token)

        self.username = generate_random_string(10)
        self.password = "password123"
        self.email = f"{generate_random_string(10)}@example.com"
        self.signup_url = reverse('signup')
        self.login_url = reverse('token_obtain_pair')
        self.signup_data = {
            'username': self.username,
            'password': self.password,
            'email': self.email
        }

        # Register the user
        self.client.post(self.signup_url, self.signup_data, format='json')

    def test_login_user_success(self):
        data = {
            'username': self.username,
            'password': self.password
        }

        response = self.client.post(self.login_url, data, format='json')

        # Assert that the login was successful
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', response.data)  # Ensure the token is returned

    def test_login_user_invalid_credentials(self):
        data = {
            'username': self.username,
            'password': 'wrongpassword'
        }

        response = self.client.post(self.login_url, data, format='json')

        # Assert that the login failed due to invalid credentials
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotIn('access_token', response.data) 

class LogoutUserViewTest(APITestCase):
    def setUp(self):
        microservices = [
            {'service_name': 'auth', 'password': os.getenv('AUTH_PASSWORD')},
            {'service_name': 'users', 'password': os.getenv('USERS_PASSWORD')},
            {'service_name': 'game', 'password': os.getenv('GAME_PASSWORD')},
            {'service_name': 'rooms', 'password': os.getenv('ROOMS_PASSWORD')},
            {'service_name': 'avatar', 'password': os.getenv('AVATAR_PASSWORD')},
        ]
        
        services_to_create = []
        
        for microservice in microservices:
            password = make_password(microservice['password'])
            services_to_create.append(Service(service_name=microservice['service_name'], password=password))
        
        Service.objects.bulk_create(services_to_create)
        
        for service in Service.objects.filter(service_name__in=[m['service_name'] for m in microservices]):
            token = createServiceToken(service)
            Token.objects.create(service_name=service.service_name, token=token)

        self.username = generate_random_string(10)
        self.password = "password123"
        self.email = f"{generate_random_string(10)}@example.com"
        self.signup_url = reverse('signup')
        self.login_url = reverse('token_obtain_pair')
        self.logout_url = reverse('auth-logout')  # Assuming a logout URL exists
        self.signup_data = {
            'username': self.username,
            'password': self.password,
            'email': self.email
        }

        # Register the user
        self.client.post(self.signup_url, self.signup_data, format='json')

    def authenticate(self):
        data = {
            'username': self.username,
            'password': self.password
        }
        response = self.client.post(self.login_url, data, format='json')
        return response.data['refresh_token']

    def test_logout_user_success(self):
        refresh_token = self.authenticate()  # Authenticate the user
        logout_data = {
            'refresh': refresh_token
        }
        response = self.client.post(self.logout_url, logout_data, format='json')  # Assuming POST request to logout

        # Assert that the response status is 200 (or whatever status you return after logging out)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Further tests could be added to ensure the token is invalidated, e.g., try a request with the same token
        # response = self.client.get(reverse('protected_view'))  # A protected view
        # self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)  # Should return Unauthorized

class RetrieveUserViewTest(APITestCase):
    def setUp(self):
        microservices = [
            {'service_name': 'auth', 'password': os.getenv('AUTH_PASSWORD')},
            {'service_name': 'users', 'password': os.getenv('USERS_PASSWORD')},
            {'service_name': 'game', 'password': os.getenv('GAME_PASSWORD')},
            {'service_name': 'rooms', 'password': os.getenv('ROOMS_PASSWORD')},
            {'service_name': 'avatar', 'password': os.getenv('AVATAR_PASSWORD')},
        ]
        
        services_to_create = []
        
        for microservice in microservices:
            password = make_password(microservice['password'])
            services_to_create.append(Service(service_name=microservice['service_name'], password=password))
        
        Service.objects.bulk_create(services_to_create)
        
        for service in Service.objects.filter(service_name__in=[m['service_name'] for m in microservices]):
            token = createServiceToken(service)
            Token.objects.create(service_name=service.service_name, token=token)

        self.username = generate_random_string(10)
        self.password = "password123"
        self.email = f"{generate_random_string(10)}@example.com"
        self.signup_url = reverse('signup')
        self.login_url = reverse('token_obtain_pair')
        self.retrieve_user_url = reverse('user_auth', kwargs={'username': self.username})
        self.signup_data = {
            'username': self.username,
            'password': self.password,
            'email': self.email
        }

        # Register the user
        self.client.post(self.signup_url, self.signup_data, format='json')

    def authenticate(self):
        data = {
            'username': self.username,
            'password': self.password
        }
        response = self.client.post(self.login_url, data, format='json')
        return response.data['access_token']

    def test_retrieve_user_success(self):
        access_token = self.authenticate()

        response = self.client.get(self.retrieve_user_url, HTTP_AUTHORIZATION=f"Bearer {access_token}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.username)

    def test_retrieve_user_not_found(self):
        # Try retrieving a non-existent user
        wrong_username = 'nonexistentuser'
        url = reverse('user_auth', kwargs={'username': wrong_username})

        access_token = self.authenticate()

        response = self.client.get(url, HTTP_AUTHORIZATION=f"Bearer {access_token}")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_retrieve_user_unauthorized(self):
        # Try retrieving another user's data (unauthorized)
        other_username = generate_random_string(10)
        other_user_data = {
            'username': other_username,
            'password': self.password,
            'email': f"{generate_random_string(10)}@example.com"
        }

        # Create another user
        self.client.post(self.signup_url, other_user_data, format='json')

        access_token = self.authenticate()

        # Attempt to retrieve the other user's data
        url = reverse('user_auth', kwargs={'username': other_username})
        response = self.client.get(url, HTTP_AUTHORIZATION=f"Bearer {access_token}")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class TwoFactorSetupViewTest(APITestCase):
    def setUp(self):
        microservices = [
            {'service_name': 'auth', 'password': os.getenv('AUTH_PASSWORD')},
            {'service_name': 'users', 'password': os.getenv('USERS_PASSWORD')},
            {'service_name': 'game', 'password': os.getenv('GAME_PASSWORD')},
            {'service_name': 'rooms', 'password': os.getenv('ROOMS_PASSWORD')},
            {'service_name': 'avatar', 'password': os.getenv('AVATAR_PASSWORD')},
        ]
        
        services_to_create = []
        
        for microservice in microservices:
            password = make_password(microservice['password'])
            services_to_create.append(Service(service_name=microservice['service_name'], password=password))
        
        Service.objects.bulk_create(services_to_create)
        
        for service in Service.objects.filter(service_name__in=[m['service_name'] for m in microservices]):
            token = createServiceToken(service)
            Token.objects.create(service_name=service.service_name, token=token)

        # Initialize user credentials and URLs
        self.username = generate_random_string(10)
        self.password = "password123"
        self.email = f"{generate_random_string(10)}@example.com"
        self.signup_url = reverse('signup')  # Adjust this URL based on your routing
        self.login_url = reverse('token_obtain_pair')  # Token endpoint
        self.two_factor_setup_url = reverse('two_factor_setup')  # URL for TwoFactorSetupView
        
        # Register the user
        self.signup_data = {
            'username': self.username,
            'password': self.password,
            'email': self.email
        }
        self.client.post(self.signup_url, self.signup_data, format='json')
        
        # Authenticate the user
        self.access_token = self.authenticate()

    def authenticate(self):
        # Authenticate and return access token
        data = {'username': self.username, 'password': self.password}
        response = self.client.post(self.login_url, data, format='json')
        return response.data['access_token']


    def test_enable_two_factor_success(self):
        # Prepare the data for enabling 2FA
        data = {'enable': True}

        # Send the POST request to enable 2FA
        response = self.client.post(
            self.two_factor_setup_url,
            data,
            format='json',
            HTTP_AUTHORIZATION=f"Bearer {self.access_token}"  # Pass the access token
        )

        # Check that the status code is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Assert that the response includes the necessary fields
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], "2FA enabled. Use this secret to configure your authenticator app.")

        # Assert that otp_secret and qr_code_url are present in the response
        self.assertIn('otp_secret', response.data)
        self.assertIn('qr_code_url', response.data)

        # Check that 2FA has actually been enabled for the user
        user = CustomUser.objects.get(username=self.username)
        self.assertTrue(user.two_factor_enabled)
        self.assertIsNotNone(user.otp_secret)
    
    def test_enable_two_factor_invalid_data(self):
        # Provide invalid data (e.g., no 'enable' key)
        data = {}

        # Send the POST request to enable 2FA
        response = self.client.post(
            self.two_factor_setup_url,
            data,
            format='json',
            HTTP_AUTHORIZATION=f"Bearer {self.access_token}"  # Pass the access token
        )

        # Assert that the status code is 400 Bad Request
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Assert that the response contains error messages
        self.assertIn('enable', response.data)

    def test_disable_two_factor_success(self):
        # First, enable 2FA to test disabling it
        data = {'enable': True}
        self.client.post(
            self.two_factor_setup_url,
            data,
            format='json',
            HTTP_AUTHORIZATION=f"Bearer {self.access_token}"  # Pass the access token
        )

        # Now, disable 2FA by sending a POST request with 'enable' set to False
        data = {'enable': False}
        response = self.client.post(
            self.two_factor_setup_url,
            data,
            format='json',
            HTTP_AUTHORIZATION=f"Bearer {self.access_token}"  # Pass the access token
        )

        # Check that the status code is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Assert that the response contains the success message for disabling 2FA
        self.assertEqual(response.data['message'], "2FA disabled.")

        # Check that the user no longer has 2FA enabled
        user = CustomUser.objects.get(username=self.username)
        self.assertFalse(user.two_factor_enabled)
        self.assertIsNone(user.otp_secret)  # Ensure the OTP secret is removed

    def test_login_with_two_factor_enabled(self):
        # First, enable 2FA for the user
        data = {'enable': True}
        response = self.client.post(
            self.two_factor_setup_url,
            data,
            format='json',
            HTTP_AUTHORIZATION=f"Bearer {self.access_token}"  # Pass the access token for authentication
        )
        
        # Assert that the 2FA is enabled
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], "2FA enabled. Use this secret to configure your authenticator app.")

        # Generate OTP using the OTP secret (this should be the same secret from the previous response)
        user = CustomUser.objects.get(username=self.username)
        totp = pyotp.TOTP(user.otp_secret)  # Generate OTP using the stored secret
        otp = totp.now()  # Get the current OTP

        # Now attempt to log in using username, password, and the OTP
        login_data = {
            'username': self.username,
            'password': self.password,
            'otp': otp  # Include the generated OTP
        }

        # Send login request
        login_response = self.client.post(self.login_url, login_data, format='json')

        # Assert that the login is successful and status is HTTP 200 OK
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

        # Check if the response contains the access token and refresh token
        self.assertIn('access_token', login_response.data)
        self.assertIn('refresh_token', login_response.data)
        
        # Ensure that the access token is valid by decoding it
        decoded_access_token = jwt.decode(login_response.data['access_token'], options={"verify_signature": False})
        self.assertEqual(decoded_access_token['username'], self.username)
