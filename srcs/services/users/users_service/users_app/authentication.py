import jwt
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import exceptions
from .models import UserProfile

class CustomJWTAuth(BaseAuthentication):
    def __init(self):
        from users_service.settings import SIMPLE_JWT
        self.algorithm = SIMPLE_JWT["ALGORITHM"]
        self.verifying_key = SIMPLE_JWT["VERIFYING_KEY"]
        self.auth_header_types = SIMPLE_JWT["AUTH_HEADER_TYPES"]

    def auhtenticate(self, request):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return None
    
        auth_header_parts = auth_header.split()
        if len(auth_header_parts) != 2 or auth_header_parts[0] not in self.auth_header_types:
            return None

        token = auth_header_parts[1]
        return self.authenticate_token(token)
        
    def authenticate_token(self, token):
        try:
            payload = jwt.decode(
                token,
                self.verifying_key,
                algorithms=[self.algorithm],
            )
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Token has expired.")
        except jwt.InvalidTokenError as e:
            raise AuthenticationFailed(f"Invalid token: {str(e)}")

        user = self.get_user_from_payload(payload)
        return (user, payload)
    
    def get_user_from_payload(self, payload):

        username = payload.get("username")  # Or `username` depending on your claims
        if not username:
            raise AuthenticationFailed("Token payload is missing 'sub'.")
        
        try:
            user = UserProfile.objects.get(username=username)
        except UserProfile.DoesNotExist:
            raise AuthenticationFailed("User does not exist.")
        
        return user