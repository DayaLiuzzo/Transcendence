import uuid

from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework import generics
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.test import APIRequestFactory
from rest_framework.views import APIView

from .authentication import CustomJWTAuth
from .models import Room
from .models import User
from .serializers import RoomSerializer
from .serializers import UserSerializer

def rooms_service_running(request):
    return JsonResponse({"message": "Rooms service is running"})

################################################################
#                                                              #
#                          Room views                          #
#                                                              #
################################################################

# ************************** CREATE ************************** #

class CreateRoomView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        room_id = f"room_{str(uuid.uuid4())[:8]}"
        try:
            new_room = Room.objects.create(room_id=room_id, status='waiting', players_count=1)
            return Response({"message": "New room created", "room_id": new_room.room_id}, status=status.HTTP_201_CREATED)
        except IntegrityError as e:
            return Response(
                {"message": "Room ID conflict, try again.", "error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response({"message": "Error while creating room", "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class JoinRoomView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        waiting_room = Room.objects.filter(status='waiting', players_count__lt=2).first()

        if waiting_room:
            return self.join_room(waiting_room)

        # Si aucune room n'est disponible, créer une nouvelle room
        return self.create_room(request)

    def join_room(self, waiting_room):
        try:
            waiting_room.players_count += 1
            if waiting_room.players_count == 2:
                waiting_room.status = 'playing'
            waiting_room.save()

            return Response({
                "message": "Room joined successfully",
                "room_id": waiting_room.room_id,
                "players_count": waiting_room.players_count,
                "status": waiting_room.status,
                "remaining_spots": 2 - waiting_room.players_count  # Nombre de places restantes
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"message": "Error while joining the room", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def create_room(self, request):
        # Créer une nouvelle room directement dans cette méthode
        room_id = f"room_{str(uuid.uuid4())[:8]}"
        try:
            new_room = Room.objects.create(room_id=room_id, status='waiting', players_count=1)
            return Response({
                "message": "New room created",
                "room_id": new_room.room_id
            }, status=status.HTTP_201_CREATED)

        except IntegrityError as e:
            return Response(
                {"message": "Room ID conflict, try again.", "error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response({
                "message": "Error while creating room",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# *************************** READ *************************** #

class ListAllRoomsView(generics.ListAPIView):
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Room.objects

class ListAvailableRoomsView(generics.ListAPIView):
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Room.objects.filter(players_count__lt=2)

class ListLockedRoomsView(generics.ListAPIView):
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Room.objects.filter(players_count=2)

class CountAllRoomsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Compter le nombre de rooms dans la base de données
        room_count = Room.objects.count()

        return Response(
            {"room_count": room_count}, 
            status=status.HTTP_200_OK
        )

class CountAvailableRoomsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Compter les rooms avec moins de 2 joueurs
        available_room_count = Room.objects.filter(players_count__lt=2).count()

        return Response(
            {"available_room_count": available_room_count},
            status=status.HTTP_200_OK
        )

class CountLockedRoomsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Compter les rooms avec 2 joueurs ou plus
        locked_room_count = Room.objects.filter(players_count__gte=2).count()

        return Response(
            {"locked_room_count": locked_room_count},
            status=status.HTTP_200_OK
        )

# ************************** DELETE ************************** #

class DeleteRoomView(generics.DestroyAPIView):
    queryset = Room.objects.all()
    permission_classes = [IsAuthenticated] 
    lookup_field = 'room_id'

    def get_object(self):
        # Récupérer la room en fonction de l'ID de la room depuis l'URL
        room_id = self.kwargs['room_id']
        return get_object_or_404(Room, room_id=room_id)

################################################################
#                                                              #
#                          User views                          #
#                                                              #
################################################################

# ************************** CREATE ************************** #

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

# *************************** READ *************************** #

class RetrieveUserView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'username'

    def get_object(self):
        return self.request.user

class ListUserView(generics.ListAPIView):
    queryset = User.objects.all()  # Récupérer tous les utilisateurs
    serializer_class = UserSerializer  # Utiliser le sérialiseur UserSerializer
    permission_classes = [IsAuthenticated]  # S'assurer que l'utilisateur est authentifié

# **************************** PUT *************************** #

class UpdateUserView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated] 

    def get_object(self):
        return self.request.user

# ************************** DELETE ************************** #

class DeleteUserView(generics.DestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated] 

    def get_object(self):
        return self.request.user
