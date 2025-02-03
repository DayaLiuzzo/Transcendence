import logging

import jwt
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from django.conf import settings
from .models import CustomUser

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
        authHeader = request.headers.get('Authorization')

        if not authHeader:
            return None
        try :
            tokenType, token = authHeader.split()
            if tokenType != 'Bearer':
                message = "Bad Bearer"
                raise AuthenticationFailed(message)
        except ValueError :
            message = "Auth Failed"
            raise AuthenticationFailed(message)

        try :
            clear_token = jwt.decode(
                    token,
                    settings.SIMPLE_JWT['VERIFYING_KEY'],
                    settings.SIMPLE_JWT['ALGORITHM'] 
                    )
        except jwt.ExpiredSignatureError :
            message = "token expired"
            raise AuthenticationFailed(message)
        except jwt.InvalidTokenError:
            message = "header info error"
            raise AuthenticationFailed(message)
        user = clear_token.get('username')
        if user is None:
            return(None, None)
        try:
            user_obj = CustomUser.objects.get(username=user)
        except CustomUser.DoesNotExist:
            message = "usr does nto exist"
            raise AuthenticationFailed(message)
        return(user_obj, token)