import jwt
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings


class CustomJWTAuth(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None
        token = self._extract_token(auth_header)
        payload = self._decode_token(token)
        request.decoded_token = payload
        self._set_username_from_payload(payload, request)
        return None
    
    def _extract_token(self, auth_header):
        try:
            token_type, token = auth_header.split()
            if token_type != 'Bearer':
                raise AuthenticationFailed("Invalid token type. Expected 'Bearer'.")
            return token
        except ValueError:
            raise AuthenticationFailed("Invalid Authorization header format. Expected 'Bearer <token>'.")
    
    def _decode_token(self, token):
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
    
    def _set_username_from_payload(self, payload, request):
        if (username := payload.get('username')) is not None:
            request.user_username = username