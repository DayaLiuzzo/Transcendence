from django.db import IntegrityError
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.shortcuts import get_list_or_404
from django.http import JsonResponse
from rest_framework import generics
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.test import APIRequestFactory
from rest_framework.views import APIView

from service_connector.service_connector import MicroserviceClient
from service_connector.exceptions import MicroserviceError
#from .authentication import CustomJWTAuth
from .models import Tournament
from .models import UserProfile
from .models import Pool
from .models import Room
from .models import TournamentHistory
from .serializers import TournamentSerializer
from .serializers import UserProfileSerializer
from .serializers import PoolSerializer
from .serializers import RoomSerializer
from .serializers import RoomSerializerInternal
from tournament_app.permissions import IsAuth
from tournament_app.permissions import IsTournament
from tournament_app.permissions import IsUsers
from tournament_app.permissions import IsGame
from tournament_app.permissions import IsOwnerAndAuthenticated
from tournament_app.permissions import IsRoom

def tournament_service_running(request):
    return JsonResponse({"message": "Tournament service is running"})

def ask_room_to_generate(pool):
    rooms = pool.rooms.filter(status='waiting')
    url = 'http://rooms:8443/api/rooms/create_room/'
    method = 'put'
    client = MicroserviceClient()
    for room in rooms:
        room_serializer = RoomSerializerInternal(room)
        response = client.send_internal_request(url, method, data=room_serializer.data)
        if response.status_code != 201:
            raise MicroserviceError(response.status_code, response.text)
        data = response.json()
        room.room_id = data.get('room_id')
        room.save()

def ask_all_rooms_to_remove(tournament):
    rooms = Room.objects.filter(pool__tournament=tournament).exclude(room_id='')
    method = 'delete'
    client = MicroserviceClient()
    for room in rooms:
        url = f'http://rooms:8443/api/rooms/delete_room/{room.room_id}/'
        response = client.send_internal_request(url, method)
        if response.status_code != 200:
            print(f'ERROR rooms to remove : {response.text}')

def add_tournament_history_to_losers(pool):
    losers = pool.users.exclude(pool.winner)
    loss = pool.tournament.loss
    for loser in losers:
        loser.tournaments.add(loss)

################################################################
#                                                              #
#                       Tournament views                       #
#                                                              #
################################################################

# ************************** POST ************************** #
class CreateTournamentView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer

    def create(self, request, *args, **kwargs):
        user = request.user
        if Tournament.objects.filter(users=user).exists():
            return Response({
                'message': 'You already are in a tournament'
                }, status=status.HTTP_400_BAD_REQUEST)

        return super().create(request, args, kwargs)

    def perform_create(self, serializer):
        user = self.request.user
        tournament = serializer.save(owner=user)
        win = TournamentHistory.objects.create(tournament=tournament, result='win')
        loss = TournamentHistory.objects.create(tournament=tournament, result='loss')
        tournament.win = win
        tournament.loss = loss
        tournament.users.add(user)
        tournament.save()

class JoinTournamentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, tournament_id):
        try:
            tournament = Tournament.objects.get(tournament_id=tournament_id)
            user = request.user

            if tournament.users.filter(username=user.username).exists():
                return Response({
                    'message': 'You are already in this tournament'
                    }, status=status.HTTP_400_BAD_REQUEST)

            if tournament.is_full():
                return Response({
                    'message': 'The tournament is full'
                    }, status=status.HTTP_400_BAD_REQUEST)

            if tournament.status != 'waiting':
                return Response({
                    'message': 'The tournament already started'
                    }, status=status.HTTP_400_BAD_REQUEST)

            tournament.users.add(user)
            serializer = TournamentSerializer(tournament)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Tournament.DoesNotExist:
            return Response({
                    'message': 'Tournament not found'
                }, status=status.HTTP_404_NOT_FOUND)

class LeaveTournamentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            user = request.user
            tournament = Tournament.objects.get(users=user)

            if tournament.status != 'waiting':
                return Response({
                    'message': 'You can only leave the tournament when it was not started'
                    }, status=status.HTTP_400_BAD_REQUEST)

            tournament.users.remove(user)
            if tournament.users_count != 0:
                if tournament.owner == user:
                    next_owner = tournament.users.first()
                    tournament.owner = next_owner
                    tournament.save()
            else:
                tournament.delete()

            return Response({
                    'message': 'You left the tournament'
                }, status=status.HTTP_200_OK)

        except Tournament.DoesNotExist:
            return Response({
                    'message': 'You are not in a tournament'
                }, status=status.HTTP_400_BAD_REQUEST)

class LaunchTournamentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            user = request.user
            tournament = Tournament.objects.get(users=user)

            if user != tournament.owner:
                return Response({
                        'message': 'Tournament cannot be launched, you are not the owner'
                    }, status=status.HTTP_403_FORBIDDEN)

            if tournament.users_count < 2:
                return Response({
                        'message': 'Cannot launch tournament alone'
                    }, status=status.HTTP_400_BAD_REQUEST)

            if tournament.status != 'waiting':
                return Response({
                        'message': 'Tournament already launched'
                    }, status=status.HTTP_400_BAD_REQUEST)

            tournament.generate_pools()
            pools = tournament.pools.filter(pool_index=tournament.pool_index - 1)

            try:
                for pool in pools:
                    ask_room_to_generate(pool)
            except MicroserviceError as e:
                tournament.status = 'error'
                ask_all_rooms_to_remove(tournament)
                tournament.save()
                return Response(e.message, e.response_text, e.status_code)

            tournament.status = 'playing'
            tournament.save()

            return Response({
                    'message': 'Tournament launched'
                }, status=status.HTTP_200_OK)

        except Tournament.DoesNotExist:
            return Response({
                    'message': 'You are not in a tournament'
                }, status=status.HTTP_400_BAD_REQUEST)

#class EndMatchView(APIView):
#    permission_classes = [IsAuthenticated]
#
#    def post(self, request, match_id, format=None):
#        try:
#            match = Match.objects.get(id=match_id)
#            
#            # Vérifier que le match est en cours
#            if match.status != 'playing':
#                return Response({
#                    "message": "Match is not currently being played."
#                }, status=status.HTTP_400_BAD_REQUEST)
#            
#            # Obtenir les scores des joueurs
#            score_player1 = request.data.get('score_player1')
#            score_player2 = request.data.get('score_player2')
#
#            # Vérifier que les deux scores ont été fournis
#            if score_player1 is None or score_player2 is None:
#                return Response({
#                    "message": "Both scores must be provided."
#                }, status=status.HTTP_400_BAD_REQUEST)
#
#            # Assigner les scores au match
#            match.score_player1 = score_player1
#            match.score_player2 = score_player2
#
#            # Vérifier et identifier le gagnant
#            winner_username = request.data.get('winner')  # Nom d'utilisateur du gagnant
#            if not winner_username:
#                return Response({
#                    "message": "Winner must be specified."
#                }, status=status.HTTP_400_BAD_REQUEST)
#
#            # Identifier le gagnant et le perdant
#            winner = UserProfile.objects.get(username=winner_username)
#            if winner not in [match.player1, match.player2]:
#                return Response({
#                    "message": "Winner must be one of the match participants."
#                }, status=status.HTTP_400_BAD_REQUEST)
#            
#            # Affecter le gagnant et le perdant
#            if winner == match.player1:
#                match.winner = match.player1
#                match.loser = match.player2
#            else:
#                match.winner = match.player2
#                match.loser = match.player1
#
#            # Marquer le match comme terminé
#            match.status = 'finished'
#            match.save()
#
#            # Mise à jour des statistiques du tournoi
#            match.tournament.update_match_stats()
#
#            return Response({
#                "message": "Match ended successfully.",
#                "match_id": match.id,
#                "winner": winner.username
#            }, status=status.HTTP_200_OK)
#
#        except Match.DoesNotExist:
#            return Response({
#                "message": "Match not found."
#            }, status=status.HTTP_404_NOT_FOUND)
#        except UserProfile.DoesNotExist:
#            return Response({
#                "message": "Winner user not found."
#            }, status=status.HTTP_404_NOT_FOUND)
        
# *************************** READ *************************** #

class ListAllTournamentView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer

class MyTournamentView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def retrieve(self, request):
        user = request.user
        tournament = get_object_or_404(Tournament,
                Q(users=user),
                Q(status='waiting') | Q(status='playing'))
        serializer = TournamentSerializer(tournament)
        return Response(serializer.data)

class IsInTournamentView(APIView):
    def get(self, request):
        user = request.user
        tournament = Tournament.objects.filter(Q(users=user), Q(status='waiting') | Q(status='playing'))
        return Response({'in_tournament': tournament.exists()})

class TournamentExistsView(APIView):
    def post(self, request):
        try:
            tournament_id = request.data.get('tournament_id')
            tournament = Tournament.objects.get(tournament_id=tournament_id)
            return Response({'exists': True})
        except:
            return Response({'exists': False})

class DetailTournamentView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    lookup_field = 'tournament_id'

class GetRoomResultView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    lookup_field = 'room_id'

class ListMyRoomsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RoomSerializer

    def list(self, request):
        user = request.user
        queryset = Room.objects.filter(
                Q(player1=user) | Q(player2=user),
                Q(status='waiting') | Q(status='standby'),
                ~Q(pool__tournament__status='error'))
        if queryset.count() == 0:
            return Response({
                'message': 'You don\'t have any rooms'
                }, status=status.HTTP_404_NOT_FOUND)

        serializer = RoomSerializer(queryset, many=True)
        return Response(serializer.data)

class ListPoolsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Pool.objects.all()
    serializer_class = PoolSerializer

    def list(self, request, tournament_id):
        queryset = get_list_or_404(Pool, tournament__tournament_id=tournament_id)
        serializer = PoolSerializer(queryset, many=True)
        return Response(serializer.data)

class ListRoomsPoolView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        tournament = get_object_or_404(Tournament, users=user, status='playing')
        rooms = get_list_or_404(Room, pool__tournament=tournament)
        rooms_serializer = RoomSerializer(rooms, many=True)
        return Response(rooms_serializer.data, status=status.HTTP_200_OK)

class ListTournamentHistoryView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        user = request.user
        serializer = TournamentSerializer(user.tournaments, many=True)
        return Response(serializer.data)

"""
class ListWaitingTournamentView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Tournament.objects.filter(status='waiting')
    serializer_class = TournamentSerializer

class ListPlayingTournamentView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Tournament.objects.filter(status='playing')
    serializer_class = TournamentSerializer

class ListFinishedTournamentView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Tournament.objects.filter(status='finished')
    serializer_class = TournamentSerializer

class CountAllTournamentView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        count = Tournament.objects.count()
        return Response({"count": count})

class CountWaitingTournamentView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        count = Tournament.objects.filter(status='waiting').count()
        return Response({"count": count})

class CountPlayingTournamentView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        count = Tournament.objects.filter(status='playing').count()
        return Response({"count": count})

class CountFinishedTournamentView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        count = Tournament.objects.filter(status='finished').count()
        return Response({"count": count})

#class TournamentStatsView(APIView):
#    def get(self, request, tournament_id, format=None):
#        try:
#            tournament = Tournament.objects.get(tournament_id=tournament_id)
#            
#            # Calculer le classement
#            ranking = calculate_ranking(tournament)
#            
#            return Response({
#                "ranking": ranking
#            }, status=status.HTTP_200_OK)
#        
#        except Tournament.DoesNotExist:
#            return Response({
#                "error": "Tournament not found"
#            }, status=status.HTTP_404_NOT_FOUND)

#class PoolMatchesView(APIView):
#    def get(self, request, tournament_id, pool_name, format=None):
#        try:
#            tournament = Tournament.objects.get(tournament_id=tournament_id)
#            pool = tournament.pools.get(name=pool_name)
#            matches = pool.get_matches()
#
#            match_data = [
#                {
#                    "player1": match.player1.username,
#                    "player2": match.player2.username,
#                    "status": match.status,
#                    "score_player1": match.score_player1,
#                    "score_player2": match.score_player2,
#                }
#                for match in matches
#            ]
#
#            return Response(match_data, status=status.HTTP_200_OK)
#
#        except Tournament.DoesNotExist:
#            return Response({"error": "Tournament not found"}, status=status.HTTP_404_NOT_FOUND)
#        except Pool.DoesNotExist:
#            return Response({"error": "Pool not found"}, status=status.HTTP_404_NOT_FOUND)

"""
# *********************** PUT / PATCH ************************ #

class SetRoomResultView(generics.UpdateAPIView):
    permission_classes = [IsRoom]

    def patch(self, request, room_id):
        room = get_object_or_404(room_id=room_id)
        tournament = room.pool.tournament
        if tournament.status != 'error':
            serializer = RoomSerializerInternal(room, data=request.data, partial=True)
            serializer.save(status='finished')
            pool = room.pool
            if pool.all_rooms_finished():
                pool.winner = pool.calculate_ranking()[0]['player']
                add_tournament_history_to_losers(pool)
                pool.save()
            elif pool.rooms_wave_finished():
                pool.generate_rooms()
                try:
                    ask_room_to_generate(pool)
                except MicroserviceError as e:
                    ask_all_rooms_to_remove(pool.tournament)
                    tournament.status = 'error'
                    tournament.save()
            if tournament.get_current_pools().count() == 1:
                tournament.winner = pool.winner
                tournament.status = 'finished'
                tournament.save()
                tournament.winner.tournaments.add(tournament.win)

# ************************** DELETE ************************** #

class DeleteTournamentView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        try:
            user = request.user
            tournament = Tournament.objects.get(users=user)
            # Vérifier que l'utilisateur est autorisé à supprimer ce tournoi (facultatif)
            # if user.is_staff or (user == tournament.owner and tournament.status != 'playing'):
            if user == tournament.owner and tournament.status == 'waiting':
                ask_all_rooms_to_remove(tournament)
                tournament.delete()
                return Response({
                    "message": "Tournament deleted successfully"
                    }, status=status.HTTP_200_OK)
            else:
                if tournament.status != 'waiting':
                    return Response({
                        "message": "Tournament has not finished yet"
                        }, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({
                        "message": "You are not the owner of this tournament"
                        }, status=status.HTTP_403_FORBIDDEN)
        
        except Tournament.DoesNotExist:
            return Response({
                "message": "You are not in a tournament"
                }, status=status.HTTP_400_BAD_REQUEST)

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

# class ListUserView(generics.ListAPIView):
#     queryset = UserProfile.objects.all()
#     serializer_class = UserProfileSerializer
#     permission_classes = [IsAuthenticated] #a changer

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

class DeleteUserView(generics.DestroyAPIView):
    permission_classes = [IsAuth]
    queryset = UserProfile.objects.all().exclude(username="deleted_account")
    serializer_class = UserProfileSerializer
    lookup_field = "username"

    # def get_object(self):
    #     return self.request.user

    # def perform_destroy(self, instance):
    #     # Si l'utilisateur est dans une tournament, dissocier la tournament et l'utilisateur
    #     if instance.tournament:
    #         tournament = instance.tournament
    #         if tournament.player1 == instance:
    #             tournament.player1 = None
    #         elif tournament.player2 == instance:
    #             tournament.player2 = None
            
    #         tournament.players_count -= 1
    #         if tournament.players_count < 2:
    #             tournament.status = 'waiting'
    #         tournament.save()

    #     instance.delete()
