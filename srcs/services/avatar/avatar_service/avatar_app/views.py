from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

from rest_framework import status 
from rest_framework.views import APIView
from rest_framework.authentication import TokenAuthentication
from rest_framework.authentication import SessionAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view
from rest_framework.decorators import authentication_classes
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.exceptions import ValidationError

import os
from django.conf import settings
from avatar_app.permissions import UserIsAuthenticated

class AvatarView(APIView):
    permission_classes = [UserIsAuthenticated]
    def get(self, request, *args, **kwargs):
        user = request.user
        return Response({"message": f"Service {user.username}is Authenticated for GET"})
    
    def patch(self, request, *args, **kwargs):
        user = request.user
        return Response({"message": f"Service {user.username}is Authenticated for PATCH"})
    
    def post(self, request, *args, **kwargs):
        user = request.user
        return Response({"message": f"Service {user.username}is Authenticated for POST"})

    
    def delete(self, request, *args, **kwargs):
        user = request.user
        return Response({"message": f"Service {user.username}is Authenticated for DELETE"})
