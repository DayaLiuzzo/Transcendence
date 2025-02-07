from rest_framework.permissions import BasePermission
import jwt

class UserIsAuthenticated(BasePermission):
    def has_permission(self, request, view):
        if request.method == 'GET':
            return True
        elif request.method == 'DELETE' or request.method == 'PATCH':
            return self.has_delete_patch_permission(request, view)
        return getattr(request, 'user_username', None) is not None
    def has_delete_patch_permission(self, request, view):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return False
        try:
            token_type, token = auth_header.split()
            if token_type != 'Bearer':
                return False
            decoded_token = getattr(request, 'decoded_token', None)
            if decoded_token is None:
                return False
            service_name = decoded_token.get('service_name')
            if service_name != 'users' and service_name != 'auth':
                return False
            return True
        except(ValueError, jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            return False
    