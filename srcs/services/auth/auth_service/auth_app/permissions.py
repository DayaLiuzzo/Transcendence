from rest_framework.permissions import BasePermission
from rest_framework.exceptions import AuthenticationFailed
from jwt import InvalidTokenError
from django.conf import settings
from auth_app.models import Service, Token
import logging 
from auth_app.models import CustomUser
import jwt

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    # filename="basic.log",
    )

# Crée un logger spécifique au module courant
logger = logging.getLogger(__name__)



class IsOwnerAndAuthenticated(BasePermission):
    def has_object_permission(self, request, view, obj):
        if not (request.user and request.user.is_authenticated):
            return False
        return obj == request.user

class IsService(BasePermission):
    def has_permission(self, request, view):
        logger.debug("Start")
        auth_header = request.headers.get('Authorization')
        logger.debug(f"Authorization header: {auth_header}")
        if not auth_header or not auth_header.startswith('Bearer '):
            raise AuthenticationFailed('ServiceToken ismissing or invalid')
        token = auth_header.split('Bearer ')[1]
        try:
            logger.debug(f"Attempting to decode token: {token}")
            payload = jwt.decode(
                token,
                settings.SIMPLE_JWT['VERIFYING_KEY'],
                algorithms=['RS256']
            )
            logger.debug("Decoded payload:", payload)
        except InvalidTokenError:
            raise AuthenticationFailed('Invalid ServiceToken.')
        return True