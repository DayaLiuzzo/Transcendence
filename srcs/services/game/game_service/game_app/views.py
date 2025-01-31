import logging
from django.http import JsonResponse

from rest_framework import generics
from rest_framework import status 
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .models import Game
from .models import User
from .models import Ball
from .models import Paddle
from .serializers import GameSerializer
from .serializers import UserSerializer
from .serializers import BallSerializer
from .serializers import PaddleSerializer
from game_app.permissions import IsAuth
from game_app.permissions import IsRooms
from game_app.permissions import IsUsers
from game_app.permissions import IsGame
from game_app.permissions import IsOwnerAndAuthenticated


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

class CreateUserView(generics.CreateAPIView):
    permission_classes =[IsAuth]
    queryset = User.objects.all()
    serializer_class = UserSerializer

# *************************** READ *************************** #

class RetrieveUserView(generics.RetrieveAPIView):
    permission_classes = [IsOwnerAndAuthenticated,IsAuth]
    queryset = User.objects.all().exclude(username="deleted_account")
    serializer_class = UserSerializer
    lookup_field = 'username'

    def get_object(self):
        return self.request.user

# **************************** PUT *************************** #

# ************************** DELETE ************************** #

class DeleteUserView(generics.DestroyAPIView):
    permission_classes = [IsAuth]
    queryset = User.objects.all().exclude(username="deleted_account")
    serializer_class = UserSerializer
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

# class ProtectedServiceView(APIView):
#     authentication_classes = []
#     permission_classes = [IsAuth]
#     def get(self, request):
#         user = request.user
#         logger.debug(f"Authenticated user in view: {user}")
#         return Response({"message": "Service is Authenticated"})
    
# class ProtectedUserView(APIView):
#     permission_classes = [IsOwnerAndAuthenticated]
#     def get(self, request):
#         user = request.user
#         logger.debug(f"Authenticated user in view: {user}")
#         return Response({"message": "User is Owner and Authenticated!"})

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

       # Créer la ball associée à la game
        ball = Ball(game=game)
        ball.save(force_insert=True)

        # Créer les paddles pour chaque joueur (sans utilisateur assigné pour l'instant)
        left_paddle = Paddle(game=game, side='left', x_position=-2.0)
        right_paddle = Paddle(game=game, side='right', x_position=2.0)
        left_paddle.save()
        right_paddle.save()

        # Associer la ball et les paddles à la game
        game.ball = ball
        game.paddles.set([left_paddle, right_paddle])
        game.save()

        game_serializer = GameSerializer(game)

        return Response({'message': f'La room {room_id} a été créée avec succès.', 'game': game_serializer.data}, status=status.HTTP_201_CREATED)

#add les permissions : users qui joinent
class JoinGame(APIView):
    def post(self, request, room_id, *args, **kwargs):
        game = get_object_or_404(Game, room_id=room_id)


        # Vérifier s'il y a une place pour l'utilisateur
        user = request.user

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
    queryset = Game.objects.all()  # Récupère toutes les parties
    serializer_class = GameSerializer  # Utilise le serializer des parties

#a proteger
class GameStateAPIView(APIView):
    def get(self, request, *args, **kwargs):
        ball = Ball.objects.first()  # Exemple, tu peux ajouter des filtres ici
        paddles = Paddle.objects.all()
        
        ball_serializer = BallSerializer(ball)
        paddles_serializer = PaddleSerializer(paddles, many=True)
        
        return Response({
            'ball': ball_serializer.data,
            'paddles': paddles_serializer.data
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
            'message': f'La partie avec l\'ID {room_id} a été supprimée avec succès.'
        }, status=status.HTTP_200_OK)
