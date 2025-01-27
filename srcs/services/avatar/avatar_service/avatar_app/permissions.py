from rest_framework.permissions import BasePermission
from rest_framework import permissions
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
import logging 

import jwt

class UserIsAuthenticated(BasePermission):
    def has_permission(self, request, view):
        if request.method == 'GET':
            return True
        elif request.method == 'DELETE' or request.method == 'PATCH':
            return False
        return getattr(request, 'user_username', None) is not None