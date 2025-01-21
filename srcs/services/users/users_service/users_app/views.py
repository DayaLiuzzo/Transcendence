import logging

from rest_framework import generics
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.status import HTTP_200_OK
from rest_framework.status import HTTP_400_BAD_REQUEST


from django.shortcuts import get_object_or_404
from .models import UserProfile
from .serializers import UserProfileSerializer
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
    

class ProtectedServiceView(APIView):
    authentication_classes = []
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