from django.utils.timezone import now
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from .models import CustomUser
import logging


logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    # filename="basic.log",
    )

# Crée un logger spécifique au module courant
logger = logging.getLogger(__name__)


class CustomJWTAuth(JWTAuthentication):
    def get_user(self, validated_token):
        logger.debug("in authentication")
        try:
            username = validated_token.get('username')
            if username is None:
                raise InvalidToken('Info not found')
            try:
                user = CustomUser.objects.get(username=username)
                user.save()
                return user
            except CustomUser.DoesNotExist:
                raise AuthenticationFailed('Unknown User')
        except CustomUser.DoesNotExist:
            raise InvalidToken('User not found')