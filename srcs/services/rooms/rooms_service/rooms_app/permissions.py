from rest_framework.permissions import BasePermission
from rest_framework.exceptions import AuthenticationFailed
from jwt import InvalidTokenError
from django.conf import settings
import logging 

import jwt

class IsService(BasePermission):
    def has_permission(self, request, view):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            raise AuthenticationFailed('ServiceToken ismissing or invalid')
        token = auth_header.split('Bearer ')[1]
        try:
            payload = jwt.decode(
                token,
                settings.SIMPLE_JWT['VERIFYING_KEY'],
                algorithms=['RS256']
            )
        except InvalidTokenError:
            raise AuthenticationFailed('Invalid ServiceToken.')
        return True