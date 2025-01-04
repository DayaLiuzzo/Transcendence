from django.utils.timezone import now

from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken

from .models import CustomUser

class CustomJWTAuth(JWTAuthentication):
    def get_user(self, validated_token):
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