import logging
import os
from rest_framework.exceptions import APIException

from service_connector.service_connector import MicroserviceClient

from rest_framework import generics
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.status import HTTP_200_OK
from rest_framework.status import HTTP_400_BAD_REQUEST


from django.core.exceptions import ValidationError
from django.conf import settings
from django.shortcuts import get_object_or_404
import requests

from .models import UserProfile
from .serializers import UserProfileSerializer
from .serializers import FriendsSerializer
from users_app.permissions import IsAuth
from users_app.permissions import IsRooms
from users_app.permissions import IsUsers
from users_app.permissions import IsGame
from users_app.permissions import IsOwner
from users_app.permissions import IsOwnerAndAuthenticated



logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    # filename="basic.log",
    )

# Crée un logger spécifique au module courant
logger = logging.getLogger(__name__)

@api_view(['GET'])
def get_example(request):
    return Response({"message": "This is a GET endpoint"}, status=status.HTTP_200_OK)

class CreateUserProfileView(generics.CreateAPIView):
    permission_classes =[IsAuth]
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer


class DeleteUserProfileView(generics.DestroyAPIView):
    permission_classes = [IsAuth]
    queryset = UserProfile.objects.all().exclude(username="deleted_account")
    serializer_class = UserProfileSerializer
    lookup_field = "username"

class RetrieveUserProfile(generics.RetrieveAPIView):
    permission_classes = [IsOwnerAndAuthenticated,IsAuth]
    queryset = UserProfile.objects.all().exclude(username="deleted_account")
    serializer_class = UserProfileSerializer
    lookup_field = "username"

class AddFriendView(APIView):
    permission_classes = [IsOwner]
    lookup_field = "username"
    def patch(self, request, username, friendusername):
        logger.debug(f"Username from URL: {username}")
        logger.debug(f"Friend's Username from URL: {friendusername}")
        user_profile = get_object_or_404(UserProfile, username=username)
        friend_profile = get_object_or_404(UserProfile, username=friendusername)
        if user_profile == friend_profile:
            return Response({"error": "You cannot add yourself as a friend that's lame."},
                            status=HTTP_400_BAD_REQUEST,)
        if user_profile.is_friend(friend_profile):
            return Response({"message": f"{friendusername} is already in your friend list dummy."},
                            status=HTTP_200_OK, )
        user_profile.add_friend(friend_profile)
        return Response({"message": f"{friendusername} has been added to your friend list"},
                        status=HTTP_200_OK, )

class RemoveFriendView(APIView):
    permission_classes = [IsOwner]
    lookup_field = "username"
    def delete(self, request, username, friendusername):
        user_profile = get_object_or_404(UserProfile, username=username)
        friend_profile = get_object_or_404(UserProfile, username=friendusername)
        if user_profile == friend_profile:
            return Response({"error": "You cannot delete yourself that's lame."},
                            status=HTTP_400_BAD_REQUEST,)
        if user_profile.is_friend(friend_profile):
            user_profile.remove_friend(friend_profile)
            return Response({"message": f"{friendusername} is no longer your friend."},
                            status=HTTP_200_OK, )
        return Response({"error": f"{friendusername} is not in your friend list."},
                        status=HTTP_400_BAD_REQUEST)


class AvatarView(APIView):
    permission_classes = [IsOwner]
    def get(self, request, *args, **kwargs):
        user = request.user
        avatar_url = user.avatar.url if user.avatar else None
        return Response({
            "message": "Avatar retrieved successfully.",
            "avatar_url": avatar_url,
            "is_default": user.avatar.name == user.avatar.field.default
        }, status=status.HTTP_200_OK)
    
    def patch(self, request, *args, **kwargs):
        """Update the user's avatar image"""
        user_profile = request.user
        avatar = request.FILES.get('avatar')

        if avatar:
            # Validate the uploaded file (optional)
            if avatar.size > 5 * 1024 * 1024:  # Limiting size to 5MB
                raise ValidationError("The file is too large. The maximum size is 5MB.")

            # Get the path to the old avatar to delete it
            old_avatar = user_profile.avatar.name
            logger.debug(f"{old_avatar}")
            if old_avatar and old_avatar != 'default.png':
                old_avatar_path = os.path.join(settings.MEDIA_ROOT, old_avatar)
                if os.path.exists(old_avatar_path):
                    os.remove(old_avatar_path)  # Delete the old avatar if it exists

            # Save the new avatar
            user_profile.avatar = avatar
            user_profile.save()

            return Response({
                'message': 'Avatar updated successfully!',
                'avatar_url': user_profile.avatar.url
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'No avatar file provided.'
            }, status=status.HTTP_400_BAD_REQUEST)


class ServiceCommunicationError(APIException):
    def __init__(self, status_code, detail="Service communication error", response_message=""):
        self.status_code = status_code
        self.detail = f"{detail} (Status Code: {status_code}) - {response_message or 'No error message provided'}"
        self.default_code = "service_error"


# class TestServiceCommunicationView(APIView):
#     permission_classes = [IsAuth]
#     def get(self, request, *args, **kwargs):
#         body = {
#             'service_name': settings.MICROSERVICE_CLIENT["SERVICE_NAME"],
#             'password': settings.MICROSERVICE_CLIENT["SERVICE_PASSWORD"],
#         }
#         response=requests.post(settings.MICROSERVICE_CLIENT["INTERNAL_TOKEN_ENDPOINT"], data = body)
#         if response.status_code != 200:
#             raise ServiceCommunicationError(response.status_code, "Invalid response status", response.json().get('detail', response.text))
        
#         token = response.json().get('token')
#         headers = {
#             "Authorization": f"Bearer {token}"
#         }
#         logger.debug(token)
#         response2= requests.get('http://game:8443/api/game/test/', headers=headers)
#         return Response(response2.json(), status=response2.status_code)

class TestServiceCommunicationView(APIView):
    permission_classes = [IsAuth]
    def get(self, request, *args, **kwargs):
        client = MicroserviceClient()
        token = client.get_new_service_token()
        headers = {
            "Authorization": f"Bearer {token}"
        }
        logger.debug(token)
        response2= requests.get('http://game:8443/api/game/test/', headers=headers)
        return Response(response2.json(), status=response2.status_code)



class ListFriendsView(generics.ListAPIView):
    serializer_class = FriendsSerializer
    permission_classes = [IsOwner]
    lookup_field = "username"
    def get_queryset(self):
        username = self.kwargs.get('username')
        user_profile = get_object_or_404(UserProfile, username=username)
        return user_profile.get_friends()
    

class ProtectedServiceView(APIView):
    # authentication_classes = []
    permission_classes = [IsAuth]
    def get(self, request):
        user = request.user
        logger.debug(f"Authenticated user in view: {user}")
        return Response({"message": "Service is Authenticated"})
    
class ProtectedUserView(APIView):
    permission_classes = [IsOwnerAndAuthenticated]
    def get(self, request):
        user = request.user
        logger.debug(f"Authenticated user in view: {user}")
        return Response({"message": "User is Owner and Authenticated!"})