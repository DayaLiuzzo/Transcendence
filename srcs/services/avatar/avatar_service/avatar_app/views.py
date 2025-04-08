from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response

import os
from django.conf import settings
from pathlib import Path 
from avatar_app.permissions import UserIsAuthenticated

from service_connector.service_connector import MicroserviceClient
from service_connector.exceptions import MicroserviceError
from .serializers import UserAvatarSerializer

class AvatarView(APIView):
    permission_classes = [UserIsAuthenticated]
    def get(self, request, *args, **kwargs):
        links = ['/media/default_avatars/default_00.jpg',]
        return Response(links, status=200)
    
    #requete interne : on sait pas si elle va reussir car c'est le user qui peut envoyer nimorte quoi on fait un try
    def post(self, request, *args, **kwargs):
        serializer = UserAvatarSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.save()
            clear_avatar(request.user_username)
            avatar_path = save_image(request.user_username, data)
            try:
                user_avatar_url = f'http://users:8443/api/users/{request.user_username}/avatar/update/' #def l'url (comme dans auth)
                client = MicroserviceClient() #c'est le sender qui est egale a une instance de microservice client, voir constructeur qui init des trucs. Checker que mes settings soient bien mis avvec service connector settings (et penser a modif le avatar password et service name)
                response2 = client.send_internal_request(user_avatar_url, 'patch', body={'avatar': avatar_path}) 
                if response2.status_code != 200: #a changer si besoin en fonction
                    raise MicroserviceError(response2.status_code, response2.text)
                return Response({'status': "avatar updated successfully"}, response2.status_code)
            except MicroserviceError as e:
                return Response(e.message, e.response_text, e.status_code)
        return Response(serializer.errors, status=400)
           
    def patch(self, request, *args, **kwargs):
        old_username = request.data.get('old_username')
        new_username = request.data.get('new_username')
        if rename_image(old_username, new_username) == True:
            return Response({"message": "Avatar updated successfully!"}, status=status.HTTP_200_OK)
        return Response({"message": f"Avatar not modified {old_username}, {new_username}"}, status=status.HTTP_304_NOT_MODIFIED) 
    
    
    def delete(self, request, *args, **kwargs):
        user = request.user
        return Response({"message": f"Service {user.username}is Authenticated for DELETE"})


def rename_image(old_username: str, new_username: str):
    extensions = ['.png', '.jpg', '.jpeg']
    avatar_dir = Path(settings.MEDIA_ROOT) / 'users_avatar'
    for ext in extensions:
        old_avatar_path = avatar_dir / f"{old_username}{ext}"
        if old_avatar_path.exists():
            old_avatar_path = str(old_avatar_path)
            new_avatar_path = new_username.join(old_avatar_path.rsplit(old_username, 1))
            os.rename(old_avatar_path, new_avatar_path)
            return True
    return False

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
    avatar_dir = Path(settings.MEDIA_ROOT) / 'users_avatar'
    for ext in extensions:
        avatar_path = avatar_dir / f"{username}{ext}"
        if avatar_path.exists(): 
            avatar_path.unlink()  
            return True
    return False