import logging

import jwt
from rest_framework import exceptions
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
from .models import UserProfile

logging.basicConfig(
    level=logging.FATAL,
    format="%(asctime)s %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    # filename="basic.log",
    )

# Crée un logger spécifique au module courant
logger = logging.getLogger(__name__)




class CustomJWTAuth(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None
        token_type, token = self._extract_token(auth_header)
        payload = self._decode_token(token)
        user = self._get_user_from_payload(payload)
        return (user, token)
    
    def _extract_token(self, auth_header):
        """
        Extract and validate the token from the Authorization header.
        """
        try:
            token_type, token = auth_header.split()
            if token_type != 'Bearer':
                raise AuthenticationFailed("Invalid token type. Expected 'Bearer'.")
            return token_type, token
        except ValueError:
            raise AuthenticationFailed("Invalid Authorization header format. Expected 'Bearer <token>'.")
    
    def _decode_token(self, token):
        """
        Decode the JWT token and validate its claims.
        """
        try:
            return jwt.decode(
                token,
                settings.SIMPLE_JWT['VERIFYING_KEY'],
                algorithms=settings.SIMPLE_JWT['ALGORITHM']
            )
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("The token has expired.")
        except jwt.InvalidTokenError:
            raise AuthenticationFailed("Invalid token.")
    
    def _get_user_from_payload(self, payload):
        """
        Retrieve the user from the decoded token payload.
        """
        username = payload.get('username')
        if not username:
            return None
        
        try:
            user = UserProfile.objects.get(username=username)
        except UserProfile.DoesNotExist:
            raise AuthenticationFailed("The user associated with this token does not exist.")
        return user
