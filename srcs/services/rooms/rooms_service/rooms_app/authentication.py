import logging

import jwt
from rest_framework import exceptions
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from .models import User

logging.basicConfig(
    level=logging.FATAL,
    format="%(asctime)s %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    # filename="basic.log",
    )

# Crée un logger spécifique au module courant
logger = logging.getLogger(__name__)



class CustomJWTAuth(BaseAuthentication):
    def __init__(self): 
        from rooms_service.settings import SIMPLE_JWT
        self.algorithm = SIMPLE_JWT["ALGORITHM"]
        self.verifying_key = SIMPLE_JWT["VERIFYING_KEY"]
        self.auth_header_types = SIMPLE_JWT["AUTH_HEADER_TYPES"]
        logger.debug(f"__init__ params: {self.algorithm}")
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return None
    
        auth_header_parts = auth_header.split()
        if len(auth_header_parts) != 2 or auth_header_parts[0] not in self.auth_header_types:
            logger.debug("wrong auth_header len")
            raise AuthenticationFailed(message)
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
        logger.debug(f"user: {user}")
        return (user, payload)
    
    def get_user_from_payload(self, payload):
        if not isinstance(payload, dict):
            raise AuthenticationFailed("Invalid token payload format.")
        
        username = payload.get("username")
        if not username:
            raise AuthenticationFailed("Token payload does not contain a valid 'username'.")
        logger.debug(f"Received username from token payload: {username}")
        
        try:
            user = User.objects.get(username=username)
            logger.debug(f"Found user with username: {username}")
            return user
        except User.DoesNotExist:
            logger.debug(f"User with username '{username}' does not exist.")
            raise AuthenticationFailed("User does not exist.")