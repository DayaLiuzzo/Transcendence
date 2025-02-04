from rest_framework.views import APIView
from rest_framework import response, status
from rest_framework.response import Response
from .serializers import UserAvatarSerializer
import os
from django.conf import settings
from avatar_app.permissions import UserIsAuthenticated
from pathlib import Path 
from service_connector.service_connector import MicroserviceClient



class AvatarView(APIView):
    permission_classes = [UserIsAuthenticated]
    def get(self, request, *args, **kwargs):
        links = ['/media/default_avatars/default_00.jpg',]
        return Response(links, status=200)
    
    def post(self, request, *args, **kwargs):
        serializer = UserAvatarSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.save()
            clear_avatar(request.user_username)
            avatar_path = save_image(request.user_username, data)
            user_avatar_url = f'http://users:8443/api/users/{request.user_username}/avatar/'
            client = MicroserviceClient()
            response2 = client.send_internal_request(user_avatar_url, 'patch', data=avatar_path)
            return Response({"message": f"POST {avatar_path} WORKEEED"})
        return Response(serializer.errors, status=400)
           

    def patch(self, request, *args, **kwargs):
        user = request.user
        return Response({"message": f"Service {user.username}is Authenticated for PATCH"})
    
    
    def delete(self, request, *args, **kwargs):
        user = request.user
        return Response({"message": f"Service {user.username}is Authenticated for DELETE"})

def save_image(username: str, validated_data):
    dir_path = os.path.join(settings.MEDIA_ROOT, 'users_avatar')
    os.makedirs(dir_path, exist_ok=True)
    image_path = os.path.join(dir_path, f"{username}.{validated_data['avatar_type']}")
    with open(image_path, 'wb') as f:
        for chunk in validated_data['avatar'].chunks():
            f.write(chunk)
    return image_path

def clear_avatar(username: str):
    extensions = ['.png', '.jpg', '.jpeg']
    avatar_dir = Path(settings.MEDIA_ROOT) / 'users_avatars'
    for ext in extensions:
        avatar_path = avatar_dir / f"{username}{ext}"
        if avatar_path.exists(): 
            avatar_path.unlink()  
            return True
    return False