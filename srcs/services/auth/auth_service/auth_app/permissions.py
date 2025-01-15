from rest_framework.permissions import BasePermission
from rest_framework import permissions
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

class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.username == request.user.username 

class IsAuthenticated(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated 


class IsOwnerAndAuthenticated(BasePermission):
    def has_object_permission(self, request, view, obj):
        if not (request.user and request.user.is_authenticated):
            return False
        return obj == request.user
