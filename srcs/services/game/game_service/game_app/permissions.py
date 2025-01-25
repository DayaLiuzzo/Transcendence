from rest_framework import permissions
from rest_framework.permissions import BasePermission
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
import logging 

import jwt


class IsOwnerAndAuthenticated(BasePermission):
    def has_object_permission(self, request, view, obj):
        if not (request.user and request.user.is_authenticated):
            return False
        return obj == request.user


def IsService(request, micro_service):
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
            service_name = payload.get('service_name')
            if service_name != micro_service:
                return False
            return True
        except (ValueError, jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            return False
        

class IsAuth(permissions.BasePermission):
    def has_permission(self, request, view):
        return IsService(request, 'auth')

class IsUsers(permissions.BasePermission):
    def has_permission(self, request, view):
        return IsService(request, 'users')

class IsGame(permissions.BasePermission):
    def has_permission(self, request, view):
        return IsService(request, 'game')
    
class IsRooms(permissions.BasePermission):
    def has_permission(self, request, view):
        return IsService(request, 'rooms')
     