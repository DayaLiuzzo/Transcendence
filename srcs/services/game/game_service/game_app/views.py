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
from .models import Ball
from .models import Paddle
from .serializers import GameSerializer
from .serializers import UserProfileSerializer
from .serializers import BallSerializer
from .serializers import PaddleSerializer
from .permissions import IsAuth
from .permissions import IsRooms
from .permissions import IsUsers
from .permissions import IsGame
from .permissions import IsOwnerAndAuthenticated


logger = logging.getLogger('game_app')

@api_view(['GET'])
def game_service_running(request):
    return JsonResponse({"message": "Game service is running"})

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
    logger.debug(f"******************* 0 JPP********************")
    permission_classes =[IsAuth]

    logger.debug(f"******************* 1 JPP********************")
    queryset = UserProfile.objects.all()
    
    logger.debug(f"******************* 2 JPP********************")
    serializer_class = UserProfileSerializer
    
    logger.debug(f"******************* 3 JPP********************")

# *************************** READ *************************** #

class RetrieveUserProfileView(generics.RetrieveAPIView):
    permission_classes = [IsOwnerAndAuthenticated,IsAuth]
    queryset = UserProfile.objects.all().exclude(username="deleted_account")
    serializer_class = UserProfileSerializer
    lookup_field = 'username'

    def get_object(self):
        return self.request.user

# **************************** PATCH *************************** #


#quand je recois une requete jai pas besoin du service connnctor donc je vais mettre juste isauth ici, (mais is_nomduservice pour les autres reqûetes)
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

    def get_object(self):
        return self.request.user

    def perform_destroy(self, instance):
        # Si l'utilisateur est dans une room, dissocier la room et l'utilisateur
        # if instance.room:
        #     room = instance.room
        #     if room.player1 == instance:
        #         room.player1 = None
        #     elif room.player2 == instance:
        #         room.player2 = None
            
        #     room.players_count -= 1
        #     if room.players_count < 2:
        #         room.status = 'waiting'
        #     room.save()

        instance.delete()

################################################################
#                                                              #
#                          Game views                          #
#                                                              #
################################################################

# *************************** CREATE ************************* #

#add les permissions : microservice room
#ajouter le lien avec le service room
class CreateGame(APIView):
    def post(self, request, room_id, *args, **kwargs):
        if Game.objects.filter(room_id=room_id).exists():
            return Response({'error': f'La room avec l\'ID {room_id} existe déjà.'}, status=status.HTTP_400_BAD_REQUEST)

        game = Game(room_id=room_id)
        game.save(force_insert=True)

        ball = Ball(game=game)
        ball.save(force_insert=True)

        left_paddle = Paddle(game=game, side='left', x_position=-2.0)
        right_paddle = Paddle(game=game, side='right', x_position=2.0)
        left_paddle.save()
        right_paddle.save()

        game.ball = ball
        game.paddles.set([left_paddle, right_paddle])
        game.save()

        game_serializer = GameSerializer(game)

        return Response({'message': f'La room {room_id} a été créée avec succes.', 'game': game_serializer.data}, status=status.HTTP_201_CREATED)

#add les permissions : users qui joinent
class JoinGame(APIView):
    def post(self, request, room_id, *args, **kwargs):
        game = get_object_or_404(Game, room_id=room_id)

        logger.debug(f"****************WESHH***********")

        user = request.user
        if game.player1 == user:
            return Response({
                'message': f'{user.username} a est deja dans la room {room_id} en tant que joueur 1.'
            }, status=status.HTTP_200_OK)#changer code erreur
        if game.player2 == user:
            return Response({
                'message': f'{user.username} a est deja dans la room {room_id} en tant que joueur 2.'
            }, status=status.HTTP_200_OK)

        if game.player1 is None:
            # Si la place de player1 est vide, l'assigner à player1
            game.player1 = user
            left_paddle = game.paddles.filter(side='left').first()
            left_paddle.player = user
            left_paddle.save()
            game.save()
            return Response({
                'message': f'{user.username} a rejoint la room {room_id} en tant que joueur 1.'
            }, status=status.HTTP_200_OK)

        elif game.player2 is None:
            # Si la place de player2 est vide, l'assigner à player2
            game.player2 = user
            right_paddle = game.paddles.filter(side='right').first()
            right_paddle.player = user
            right_paddle.save()
            game.save()
            return Response({
                'message': f'{user.username} a rejoint la room {room_id} en tant que joueur 2.'
            }, status=status.HTTP_200_OK)

        else:
            # Si les deux places sont occupées
            return Response({
                'error': 'La room est déjà pleine.'
            }, status=status.HTTP_400_BAD_REQUEST)


# *************************** READ *************************** #

class GameListAPIView(generics.ListAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer

#a proteger
class GameStateAPIView(APIView):
    def get(self, request, room_id, *args, **kwargs):
        game = get_object_or_404(Game, room_id=room_id)
        
        game_serializer = GameSerializer(game)
        
        return Response({
            'game': game_serializer.data,
        })
    
# ************************** DELETE ************************** #

class DeleteGame(APIView):
    def delete(self, request, room_id, *args, **kwargs):
        game = get_object_or_404(Game, room_id=room_id)

        paddles = game.paddles.all()
        for paddle in paddles:
            paddle.delete()

        if game.ball:
            game.ball.delete()

        game.delete()

        return Response({
            'message': f'La partie {room_id} a ete supprimee avec succes.'
        }, status=status.HTTP_200_OK)
