import logging
from django.http import JsonResponse

from rest_framework import generics
from rest_framework import status 
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView


from .models import User
from .models import Ball
from .models import Paddle
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
#                       Game state views                       #
#                                                              #
################################################################

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