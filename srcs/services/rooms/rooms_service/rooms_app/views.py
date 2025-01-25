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
from rooms_app.permissions import IsAuth
from rooms_app.permissions import IsRooms
from rooms_app.permissions import IsUsers
from rooms_app.permissions import IsGame
from rooms_app.permissions import IsOwnerAndAuthenticated

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
            user = request.user
            new_room.player1 = user
            new_room.save()

            # Mise à jour de l'utilisateur
            user.room = new_room
            user.isconnected = True
            user.save()
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
            return self.join_room(request, waiting_room)

        # Si aucune room n'est disponible, créer une nouvelle room
        return self.create_room(request)

    def join_room(self, request, waiting_room):
        try:
            user = request.user

            # Vérifier si l'utilisateur est déjà dans une room
            if user.room:
                return Response({
                    "message": "You are already in a room.",
                }, status=status.HTTP_400_BAD_REQUEST)

            # Vérifier si la room est pleine
            if waiting_room.players_count >= 2:
                return Response({
                    "message": "The room is already full.",
                }, status=status.HTTP_400_BAD_REQUEST)

            # Vérifier si la room est dans un statut incorrect
            if waiting_room.status != 'waiting':
                return Response({
                    "message": "This room is not available for joining.",
                }, status=status.HTTP_400_BAD_REQUEST)

            # Vérifier si player1 et player2 sont déjà occupés
            if waiting_room.player1 and waiting_room.player2:
                return Response({
                    "message": "This room already has two players.",
                }, status=status.HTTP_400_BAD_REQUEST)

            # Associer l'utilisateur à la room en tant que player1 ou player2
            if not waiting_room.player1:
                waiting_room.player1 = user
            elif not waiting_room.player2:
                waiting_room.player2 = user

            waiting_room.players_count += 1
            if waiting_room.players_count == 2:
                waiting_room.status = 'playing'
            waiting_room.save()

            # Mise à jour de l'utilisateur
            user.room = waiting_room
            user.isconnected = True
            user.save()

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
        room_id = self.kwargs['room_id']
        return get_object_or_404(Room, room_id=room_id)

    def perform_destroy(self, instance):
            # Avant de supprimer la room, dissocier les utilisateurs de cette room
            if instance.player1:
                instance.player1.room = None
                instance.player1.isconnected = False
                instance.player1.save()
            
            if instance.player2:
                instance.player2.room = None
                instance.player2.isconnected = False
                instance.player2.save()

            instance.delete()

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

# class ListUserView(generics.ListAPIView):
#     queryset = User.objects.all()
#     serializer_class = UserSerializer
#     permission_classes = [IsAuthenticated] #a changer

# **************************** PUT *************************** #

# class UpdateUserView(generics.UpdateAPIView):
#     queryset = User.objects.all()
#     serializer_class = UserSerializer
#     permission_classes = [IsAuthenticated] 

#     def get_object(self):
#         return self.request.user

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
        if instance.room:
            room = instance.room
            if room.player1 == instance:
                room.player1 = None
            elif room.player2 == instance:
                room.player2 = None
            
            room.players_count -= 1
            if room.players_count < 2:
                room.status = 'waiting'
            room.save()

        instance.delete()