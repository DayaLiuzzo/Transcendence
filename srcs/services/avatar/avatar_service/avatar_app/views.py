from rest_framework.views import APIView

from rest_framework.response import Response


import os
from django.conf import settings
from avatar_app.permissions import UserIsAuthenticated

class AvatarView(APIView):
    permission_classes = [UserIsAuthenticated]
    def get(self, request, *args, **kwargs):
        links = ['/media/default_avatars/default_00.jpg',]
        return Response(links, status=200)
    
    def post(self, request, *args, **kwargs):
        user = request.user
        return Response({"message": f"Service {user.username}is Authenticated for POST"})

    def patch(self, request, *args, **kwargs):
        user = request.user
        return Response({"message": f"Service {user.username}is Authenticated for PATCH"})
    
    
    def delete(self, request, *args, **kwargs):
        user = request.user
        return Response({"message": f"Service {user.username}is Authenticated for DELETE"})
