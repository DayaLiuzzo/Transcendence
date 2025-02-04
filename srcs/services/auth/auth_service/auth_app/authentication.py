from django.utils.timezone import now

from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken

from .models import CustomUser
import logging

logger = logging.getLogger(__name__)

class CustomJWTAuth(JWTAuthentication):
    def get_user(self, validated_token):
        try:
            username = validated_token.get('username')
            if username is None:
                raise AuthenticationFailed('Username not found in token')

            try:
                user = CustomUser.objects.get(username=username)
                user.save() 
                return user
            except CustomUser.DoesNotExist:
                raise AuthenticationFailed('Unknown User')

        except Exception as e:
            raise AuthenticationFailed(f"Error extracting user: {e}")
