import logging
import uuid

from django.db import IntegrityError
from django.db.models import Q
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
from .models import Room
from .models import UserProfile
from .serializers import RoomSerializer
from .serializers import RoomSerializerInternal
from .serializers import UserProfileSerializer
from .permissions import IsAuth
from .permissions import IsRooms
from .permissions import IsUsers
from .permissions import IsGame
from .permissions import IsOwnerAndAuthenticated
from .permissions import IsTournament
from service_connector.service_connector import MicroserviceClient
from service_connector.exceptions import MicroserviceError

logger = logging.getLogger('rooms_app')

@api_view(['GET'])
def rooms_service_running(request):
    return JsonResponse({"message": "Rooms service is running"})

################################################################
#                                                              #
#                          User views                          #
#                                                              #
################################################################

# ************************** CREATE ************************** #

class CreateUserView(generics.CreateAPIView):
    permission_classes =[IsAuth]
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

# *************************** READ *************************** #

class RetrieveUserView(generics.RetrieveAPIView):
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
        new_username = request.data.get("new_username")
        user_profile.username = new_username
        user_profile.save()
        return Response({"message": f"Username updated from {old_username} to {new_username}"}, status=status.HTTP_200_OK)


# ************************** DELETE ************************** #

class DeleteUserView(generics.DestroyAPIView):
    permission_classes = [IsAuth]
    queryset = UserProfile.objects.all().exclude(username="deleted_account")
    serializer_class = UserProfileSerializer
    lookup_field = "username"

    # def get_object(self):
    #     return self.request.user

    # def perform_destroy(self, instance):
    #     # Si l'utilisateur est dans une room, dissocier la room et l'utilisateur
    #     if instance.room:
    #         room = instance.room
    #         if room.player1 == instance:
    #             room.player1 = None
    #         elif room.player2 == instance:
    #             room.player2 = None
            
    #         room.players_count -= 1
    #         if room.players_count < 2:
    #             room.status = 'waiting'
    #         room.save()

    #     instance.delete()

################################################################
#                                                              #
#                          Room views                          #
#                                                              #
################################################################

# ************************** CREATE ************************** #

#peut etre utilisee par tournament maybe ??
class CreateRoomView(APIView):
    permission_classes = [IsTournament]

    def put(self, request, *args, **kwargs):
        room_id = f"room_{str(uuid.uuid4())[:8]}"
        try:
            data = request.data
            data['room_id'] = room_id
            data['players_count'] = 2

            serializer = RoomSerializerInternal(data=data)
            serializer.is_valid(raise_exception=True)
            new_room = serializer.save()

            new_room.is_from_tournament = True
            new_room.save()
            player1 = serializer.validated_data.get('player1')
            player2 = serializer.validated_data.get('player2')

            player1.rooms.add(new_room)
            player2.rooms.add(new_room)

            #call create game
            create_game_url = f'http://game:8443/api/game/create_game/{new_room.room_id}/tournament'
            client = MicroserviceClient()
            response = client.send_internal_request(create_game_url, 'post')
            if response.status_code != 201:
                raise MicroserviceError(response.status_code, response.text)

            join_game_data = {}
            join_game_data['user'] = player1.username
            #call join game
            join_game_url = f'http://game:8443/api/game/join_game/{new_room.room_id}/'
            response = client.send_internal_request(join_game_url, 'post', data=join_game_data)
            if response.status_code != 200:
                raise MicroserviceError(response.status_code, response.text)

            join_game_data['user'] = player2.username
            response = client.send_internal_request(join_game_url, 'post', data=join_game_data)
            if response.status_code != 200:
                raise MicroserviceError(response.status_code, response.text)

            return Response({"message": "New room created", "room_id": new_room.room_id}, status=status.HTTP_201_CREATED)
        
        except IntegrityError as e:
            return Response(
                {"message": "Room ID conflict, try again.", "error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        #except Exception as e:
        #    return Response({"message": "Error while creating room", "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class JoinRoomView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):

        user = request.user

        waiting_room = Room.objects.filter(status='waiting', players_count__lt=2).exclude(player1=user).exclude(player2=user).first()

        if waiting_room:
            return self.join_room(request, waiting_room, user)
        return self.create_room(request, user)

    def join_room(self, request, waiting_room, user):
        try:
            if not waiting_room.player1:
                waiting_room.player1 = user
            elif not waiting_room.player2:
                waiting_room.player2 = user

            waiting_room.players_count += 1
            if waiting_room.players_count == 2:
                waiting_room.status = 'playing'
            waiting_room.save()

            user.rooms.add(waiting_room)
            user.save()

            #call join game
            join_game_url = f'http://game:8443/api/game/join_game/{waiting_room.room_id}/'
            client = MicroserviceClient()
            response2 = client.send_internal_request(join_game_url, 'post', data={'user': user.username})
            
            if response2.status_code != 200: #a changer si besoin en fonction
                raise MicroserviceError(response2.status_code, response2.text)
            return Response({"message": "User successfuly added to a room", "room_id": waiting_room.room_id}, status=status.HTTP_200_OK)

        except MicroserviceError as e:
                return Response(e.message, e.response_text, e.status_code)
        except Exception as e:
            return Response(
                {"message": "Error while joining the room", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def create_room(self, request, user):
        room_id = f"room_{str(uuid.uuid4())[:8]}"
        try:
            new_room = Room.objects.create(room_id=room_id, status='waiting', players_count=1)
            new_room.player1 = user
            new_room.room_id = room_id
            new_room.save()
            
            user.rooms.add(new_room)
            user.save()

            #call create game
            create_game_url = f'http://game:8443/api/game/create_game/{new_room.room_id}/'
            client = MicroserviceClient()
            response2 = client.send_internal_request(create_game_url, 'post')
            if response2.status_code != 201:
                raise MicroserviceError(response2.status_code, response2.text)

            #call join game
            join_game_url = f'http://game:8443/api/game/join_game/{new_room.room_id}/'
            client = MicroserviceClient()
            response3 = client.send_internal_request(join_game_url, 'post', data={'user': user.username})
            if response3.status_code != 200:
                raise MicroserviceError(response3.status_code, response3.text)
            

            return Response({"message": "User successfuly added to a room", "room_id": new_room.room_id}, status=status.HTTP_200_OK)

        except IntegrityError as e:
            return Response({"message": "Room ID conflict, try again.", "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST
            )
        except MicroserviceError as e:
            return Response(e.message, e.response_text, e.status_code)
        except Exception as e:
            return Response({
                "message": "Error while creating room blup",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class QuitRoomView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user

        room_id = request.data.get("room_id")
        if not room_id:
            return Response({
                "message": "Room ID is required.",
            }, status=status.HTTP_400_BAD_REQUEST)

        room = get_object_or_404(Room, room_id=room_id)

        if room not in user.rooms.all():
            return Response({
                "message": "You are not in this room.",
            }, status=status.HTTP_400_BAD_REQUEST)

        if room.player1 == user:
            room.player1 = None
        elif room.player2 == user:
            room.player2 = None


        room.players_count -= 1

        if room.players_count < 2:
            room.status = 'waiting'

        room.save()

        user.rooms.remove(room)
        user.save()

        return Response({
            "message": f"You have successfully left the room {room.room_id}.",
            "room_id": room.room_id,
            "players_count": room.players_count,
            "status": room.status,
        }, status=status.HTTP_200_OK)

class QuitAllRoomsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        rooms_to_leave = user.rooms.all()

        if not rooms_to_leave:
            return Response({"message": "You are not in any room."}, status=status.HTTP_400_BAD_REQUEST)

        for room in rooms_to_leave:
            room.players_count -= 1
            if room.players_count < 2:
                room.status = 'waiting'
            room.save()

            user.rooms.remove(room)

        user.save()
        return Response({"message": "You have successfully left all rooms."}, status=status.HTTP_200_OK)

class UpdateRoomView(APIView):
    permission_classes = [IsGame]

    def patch(self, request, room_id):
        room = get_object_or_404(Room, room_id=room_id)
        serializer = RoomSerializerInternal(room, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        if room.is_from_tournament:
            client = MicroserviceClient()
            url = f'http://tournament:8443/api/tournament/room_result/{room.room_id}/'
            client = MicroserviceClient()
            response = client.send_internal_request(join_game_url, 'patch', data=serializer.data)
            
            if response.status_code != 200: #a changer si besoin en fonction
                print(f"ERROR communication between tournament and rooms service : {response.status_code}")

        else:
            if request.data['status'] == 'deleted':
                room.delete()
        return Response(status=status.HTTP_200_OK)


# *************************** READ *************************** #

class ListMyFinishedRoomsView(generics.ListAPIView):
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        user = request.user
        rooms = Room.objects.filter(
                Q(status='finished'),
                Q(player1=user) | Q(player2=user))
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data)


class ListAllRoomsView(generics.ListAPIView):
    serializer_class = RoomSerializer
    permission_classes = [IsRooms]

    def get_queryset(self):
        return Room.objects

class ListAvailableRoomsView(generics.ListAPIView):
    serializer_class = RoomSerializer
    permission_classes = [IsRooms]

    def get_queryset(self):
        return Room.objects.filter(players_count__lt=2)

class ListLockedRoomsView(generics.ListAPIView):
    serializer_class = RoomSerializer
    permission_classes = [IsRooms]

    def get_queryset(self):
        return Room.objects.filter(players_count=2)

class CountAllRoomsView(APIView):
    permission_classes = [IsRooms]

    def get(self, request, *args, **kwargs):
        # Compter le nombre de rooms dans la base de données
        room_count = Room.objects.count()

        return Response(
            {"room_count": room_count}, 
            status=status.HTTP_200_OK
        )

class CountAvailableRoomsView(APIView):
    permission_classes = [IsRooms]

    def get(self, request, *args, **kwargs):
        available_room_count = Room.objects.filter(players_count__lt=2).count()

        return Response(
            {"available_room_count": available_room_count},
            status=status.HTTP_200_OK
        )

class CountLockedRoomsView(APIView):
    permission_classes = [IsRooms]

    def get(self, request, *args, **kwargs):
        locked_room_count = Room.objects.filter(players_count__gte=2).count()

        return Response(
            {"locked_room_count": locked_room_count},
            status=status.HTTP_200_OK
        )

# ************************** DELETE ************************** #

class DeleteRoomView(generics.DestroyAPIView):
    permission_classes = (IsRooms|IsTournament,)
    queryset = Room.objects.all()
    # permission_classes = [IsAuthenticated] 
    lookup_field = 'room_id'

    def get_object(self):
        room_id = self.kwargs['room_id']
        return get_object_or_404(Room, room_id=room_id)

    def perform_destroy(self, instance):
            # Avant de supprimer la room, dissocier les utilisateurs de cette room
            if instance.player1:
                instance.player1.room = None
                # instance.player1.isconnected = False
                instance.player1.save()
            
            if instance.player2:
                instance.player2.room = None
                # instance.player2.isconnected = False
                instance.player2.save()

            instance.delete()

# ************************** connexion avec game ************************** #

    # #requete interne : on sait pas si elle va reussir car c'est le user qui peut envoyer nimorte quoi on fait un try
    # def post(self, request, *args, **kwargs):
    #     serializer = UserAvatarSerializer(data=request.data)
    #     if serializer.is_valid():
    #         data = serializer.save()
    #         clear_avatar(request.user_username)
    #         avatar_path = save_image(request.user_username, data)
    #         try:
    #             user_avatar_url = f'http://users:8443/api/users/{request.user_username}/avatar/update/' #def l'url (comme dans auth)
    #             client = MicroserviceClient() #c'est le sender qui est egale a une instance de microservice client, voir constructeur qui init des trucs. Checker que mes settings soient bien mis avvec service connector settings (et penser a modif le avatar password et service name)
    #             response2 = client.send_internal_request(user_avatar_url, 'patch', body={'avatar': avatar_path}) 
    #             if response2.status_code != 200: #a changer si besoin en fonction
    #                 raise MicroserviceError(response2.status_code, response2.text)
    #             return Response({'status': "avatar updated successfully"}, response2.status_code)
    #         except MicroserviceError as e:
    #             return Response(e.message, e.response_text, e.status_code)
    #     return Response(serializer.errors, status=400)
           
    # def patch(self, request, *args, **kwargs):
    #     old_username = request.data.get('old_username')
    #     new_username = request.data.get('new_username')
    #     if rename_image(old_username, new_username) == True:
    #         return Response({"message": "Avatar updated successfully!"}, status=status.HTTP_200_OK)
    #     return Response({"message": f"Avatar not modified {old_username}, {new_username}"}, status=status.HTTP_304_NOT_MODIFIED) 
    
