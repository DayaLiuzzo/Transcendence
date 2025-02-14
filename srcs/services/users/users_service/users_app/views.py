from rest_framework import generics
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.status import HTTP_200_OK
from rest_framework.status import HTTP_400_BAD_REQUEST
from rest_framework.status import HTTP_409_CONFLICT


from django.shortcuts import get_object_or_404

from .models import UserProfile
from .serializers import UserProfileSerializer
from .serializers import FriendsSerializer
from users_app.permissions import IsAuth
from users_app.permissions import IsAvatar
from users_app.permissions import IsOwner
from users_app.permissions import IsOwnerAndAuthenticated


#================================================
#================= User Profile =================
#================================================

class CreateUserProfileView(generics.CreateAPIView):
    permission_classes =[IsAuth]
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

class DeleteUserProfileView(generics.DestroyAPIView):
    permission_classes = [IsAuth]
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    lookup_field = "username"

class RetrieveUserProfile(generics.RetrieveAPIView):
    permission_classes = [IsOwnerAndAuthenticated]
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    lookup_field = "username"

class UpdateUserProfileView(APIView):
    permission_classes = [IsAuth]
    queryset = UserProfile.objects.all()
    def patch (self, request, username):
        user_profile = get_object_or_404(UserProfile, username=username)
        old_username = user_profile.username
        new_username = request.data.get("new_username")
        if user_profile.avatar != user_profile.avatar_default_path:
            avatar_url = user_profile.avatar
            new_avatar_url = avatar_url.replace(old_username, new_username)
            user_profile.avatar = new_avatar_url
        user_profile.username = new_username
        user_profile.save()
        return Response({"message": f"Username updated from {old_username} to {new_username}"}, status=HTTP_200_OK)

#================================================
#================= User Friends =================
#================================================

class AddFriendView(APIView):
    permission_classes = [IsOwner]
    lookup_field = "username"
    def patch(self, request, username, friendusername):
        user_profile = get_object_or_404(UserProfile, username=username)
        friend_profile = get_object_or_404(UserProfile, username=friendusername)
        if user_profile == friend_profile:
            return Response({"error": "You cannot add yourself as a friend that's lame."},
                            status=HTTP_400_BAD_REQUEST,)
        if user_profile.is_friend(friend_profile):
            return Response({"message": f"{friendusername} is already in your friend list dummy."},
                            status=HTTP_409_CONFLICT, )
        user_profile.friends.add(friend_profile)
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

class ListFriendsView(generics.ListAPIView):
    serializer_class = FriendsSerializer
    permission_classes = [IsOwner]
    lookup_field = "username"
    def get_queryset(self):
        username = self.kwargs.get('username')
        user_profile = get_object_or_404(UserProfile, username=username)
        return user_profile.get_friends()
    
#================================================
#================= User Avatar ==================
#================================================

class AvatarUpdateView(APIView):
    permission_classes=[IsAvatar]
    def patch(self, request, username):
        user_profile = UserProfile.objects.get(username=username)
        avatar_new_path = request.data.get("avatar")
        if avatar_new_path:
            user_profile.avatar = avatar_new_path
            user_profile.save()
            return Response({
                'message': 'Avatar updated successfully!',
                'avatar_url': user_profile.avatar
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'No avatar file provided.'
            }, status=status.HTTP_400_BAD_REQUEST)

class AvatarView(APIView):
    permission_classes=[IsOwner]
    lookup_field = "username"
    def get(self, request, username):
        try:
            user = UserProfile.objects.get(username=username)
            avatar_url = user.avatar if user.avatar else None
            return Response({
                "message": "Avatar retrieved successfully.",
                "avatar_url": avatar_url,
            }, status=status.HTTP_200_OK)
        except UserProfile.DoesNotExist:
            return Response({
                "error": "User not found."
            }, status=status.HTTP_404_NOT_FOUND)
