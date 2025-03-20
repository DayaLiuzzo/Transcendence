import logging

from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework import status 
from rest_framework.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.test import APIRequestFactory
from rest_framework.views import APIView

from .authentication import CustomJWTAuth
from .models import Game
from .models import UserProfile
from .serializers import GameSerializer
from .serializers import UserProfileSerializer
from .permissions import IsAuth
from .permissions import IsRooms
from .permissions import IsUsers
from .permissions import IsGame
from .permissions import IsOwnerAndAuthenticated


logger = logging.getLogger('game_app')

@api_view(['GET'])
def game_service_running(request):
    return Response({"message": "Game service is running"})

# @api_view(['GET'])
# def gameroom(request, room_name):
#     data = {'room_name': room_name, 'message': 'Bienvenue dans la salle !'}
#     return Response(data, status=status.HTTP_200_OK)

################################################################
#                                                              #
#                          User views                          #
#                                                              #
################################################################

# ************************** CREATE ************************** #

class CreateUserProfileView(generics.CreateAPIView):
    permission_classes =[IsAuth]
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    

# *************************** READ *************************** #

class RetrieveUserProfileView(generics.RetrieveAPIView):
    permission_classes = [IsOwnerAndAuthenticated,IsAuth]
    queryset = UserProfile.objects.all().exclude(username="deleted_account")
    serializer_class = UserProfileSerializer
    lookup_field = 'username'

    def get_object(self):
        return self.request.user

# **************************** PATCH *************************** #


class UpdateUserProfileView(APIView):
    permission_classes = [IsAuth]
    queryset = UserProfile.objects.all()
    def patch (self, request, username):
        user_profile = get_object_or_404(UserProfile, username=username)
        old_username = user_profile.username
        new_username = request.data.get("new_username") #attention a bien utiliser get, sinon on peut faire segfault
        user_profile.username = new_username
        user_profile.save()
        return Response({"message": f"Username updated from {old_username} to {new_username}"}, status=status.HTTP_200_OK)


# ************************** DELETE ************************** #

class DeleteUserProfileView(generics.DestroyAPIView):
    permission_classes = [IsAuth]
    queryset = UserProfile.objects.all().exclude(username="deleted_account")
    serializer_class = UserProfileSerializer
    lookup_field = "username"

    # def get_object(self):
    #     return self.request.user

    # def perform_destroy(self, instance):
    #     # Si l'utilisateur est dans une room, dissocier la room et l'utilisateur
    #     # if instance.room:
    #     #     room = instance.room
    #     #     if room.player1 == instance:
    #     #         room.player1 = None
    #     #     elif room.player2 == instance:
    #     #         room.player2 = None
            
    #     #     room.players_count -= 1
    #     #     if room.players_count < 2:
    #     #         room.status = 'waiting'
    #     #     room.save()

    #     instance.delete()

################################################################
#                                                              #
#                          Game views                          #
#                                                              #
################################################################

# *************************** CREATE ************************* #

#called by Rooms service when creating a rooms
class CreateGame(APIView):
    permission_classes = [IsRooms]
    def post(self, request, room_id, *args, **kwargs):
        if Game.objects.filter(room_id=room_id).exists():
            return Response({'error': f'La room avec l\'ID {room_id} existe déjà.'}, status=status.HTTP_400_BAD_REQUEST)

        game = Game(room_id=room_id, from_tournament=False)
        game.save()

        return Response(status=status.HTTP_201_CREATED)

#called by Rooms service when creating a rooms
class CreateGameTournament(APIView):
    permission_classes = [IsRooms]
    def post(self, request, room_id, *args, **kwargs):
        if Game.objects.filter(room_id=room_id).exists():
            return Response({'error': f'La room avec l\'ID {room_id} existe déjà.'}, status=status.HTTP_400_BAD_REQUEST)

        game = Game(room_id=room_id, from_tournament=True)
        game.save()

        return Response(status=status.HTTP_201_CREATED)

#called by Rooms service when adding a user to a game
class JoinGame(APIView):
    permission_classes = [IsRooms]
    def post(self, request, room_id, *args, **kwargs):
        game = get_object_or_404(Game, room_id=room_id)

        user_username = request.data.get("user")  # Assuming you send the username
        user = get_object_or_404(UserProfile, username=user_username)  # Retrieve user by username

        if game.player1 is None:
            game.player1 = user
            game.save()
            return Response({
                'message': f'{user.username} a rejoint la room {room_id} en tant que joueur 1.'
            }, status=status.HTTP_200_OK)
        elif game.player2 is None:
            game.player2 = user
            game.save()
            return Response({
                'message': f'{user.username} a rejoint la room {room_id} en tant que joueur 2.'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'message': 'Game is full.'
            }, status=status.HTTP_400_BAD_REQUEST)


# *************************** READ *************************** #


class GameListAPIView(generics.ListAPIView):
    # permission_classes = [IsGame]
    queryset = Game.objects.all()
    serializer_class = GameSerializer

#a proteger
class GameStateAPIView(APIView):
    # permission_classes = [IsGame]
    def get(self, request, room_id, *args, **kwargs):
        game = get_object_or_404(Game, room_id=room_id)
        
        game_serializer = GameSerializer(game)
        
        return Response({
            'game': game_serializer.data,
        })
    
# ************************** DELETE ************************** #

class DeleteGame(APIView):
    permission_classes = [IsRooms]
    def delete(self, request, room_id, *args, **kwargs):
        game = get_object_or_404(Game, room_id=room_id)

        game.delete()

        return Response({
            'message': f'La partie {room_id} a ete supprimee avec succes.'
        }, status=status.HTTP_200_OK)
