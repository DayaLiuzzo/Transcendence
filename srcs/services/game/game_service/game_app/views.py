import logging
from django.http import JsonResponse

from rest_framework import generics
from rest_framework import status 
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView



from .models import CustomUser
from .serializers import CustomUserSerializer
from game_app.permissions import IsAuth
from game_app.permissions import IsRooms
from game_app.permissions import IsUsers
from game_app.permissions import IsGame
from game_app.permissions import IsOwnerAndAuthenticated


logger = logging.getLogger('game_app')  # Utilisez le logger de votre application spécifique

@api_view(['GET'])
def game_service_running(request):
    return JsonResponse({"message": "Game service is running"})

@api_view(['GET'])
def gameroom(request, room_name):
    data = {'room_name': room_name, 'message': 'Bienvenue dans la salle !'}
    return Response(data, status=status.HTTP_200_OK)

class CreateCustomUserView(generics.CreateAPIView):
    permission_classes = [IsAuth]
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer

class DeleteCustomUserView(generics.DestroyAPIView):
    permission_classes = [IsAuth]
    queryset = CustomUser.objects.all().exclude(username="deleted_account")
    serializer_class = CustomUserSerializer
    lookup_field = "username"

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
    

class IsUsersView(APIView):
    permission_classes = [IsUsers]  # Requires the user to be authenticated and have the 'isUsers' permission
    def get(self, request, *args, **kwargs):
        return Response({"message": "Hello, this is a protected view for Users service!"})