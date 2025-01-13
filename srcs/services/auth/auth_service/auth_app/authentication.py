from django.utils.timezone import now

from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken

from .models import CustomUser
import logging

logger = logging.getLogger(__name__)

class CustomJWTAuth(JWTAuthentication):
    def authenticate(self, request):
        if request.method == 'POST' and 'refresh' in request.data:
            refresh_token = request.data.get('refresh')
            logger.debug(f"Found refresh token in body: {refresh_token}")

            try:
                validated_token = self.get_validated_token(refresh_token)
                logger.debug(f"Validated token: {validated_token}")

                user = self.get_user(validated_token)
                logger.debug(f"Authenticated user: {user.username}")

                return (user, validated_token)

            except Exception as e:
                logger.error(f"Error during authentication: {e}")
                raise AuthenticationFailed('Invalid refresh token')

        return super().authenticate(request)

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
