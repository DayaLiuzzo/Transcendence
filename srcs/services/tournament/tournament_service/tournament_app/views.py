from django.db import IntegrityError
from django.db.models import Q
from django.shortcuts import get_object_or_404
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

from .authentication import CustomJWTAuth
from .models import Tournament
from .models import UserProfile
from .models import Pool
from .models import Match
from .serializers import TournamentSerializer
from .serializers import UserProfileSerializer
from .serializers import MatchSerializer
from tournament_app.permissions import IsAuth
from tournament_app.permissions import IsTournament
from tournament_app.permissions import IsUsers
from tournament_app.permissions import IsGame
from tournament_app.permissions import IsOwnerAndAuthenticated
from tournament_app.permissions import IsRoom
from .utils import calculate_ranking

def tournament_service_running(request):
    return JsonResponse({"message": "Tournament service is running"})

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
        tournament.users.add(user)

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
                print(tournament.owner, user)
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

            # TODO: send requests to rooms service

            tournament.status = 'playing'
            tournament.save()

            pool = Pool.objects.get(users=user)
            matches_queryset = Match.objects.filter(Q(pool=pool) & (Q(player_1=user) | Q(player_2=user)))
            matches_serializer = MatchSerializer(matches_queryset, many=True)
            return Response(matches_serializer.data, status=status.HTTP_200_OK)

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
#            score_player_1 = request.data.get('score_player_1')
#            score_player_2 = request.data.get('score_player_2')
#
#            # Vérifier que les deux scores ont été fournis
#            if score_player_1 is None or score_player_2 is None:
#                return Response({
#                    "message": "Both scores must be provided."
#                }, status=status.HTTP_400_BAD_REQUEST)
#
#            # Assigner les scores au match
#            match.score_player_1 = score_player_1
#            match.score_player_2 = score_player_2
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
#            if winner not in [match.player_1, match.player_2]:
#                return Response({
#                    "message": "Winner must be one of the match participants."
#                }, status=status.HTTP_400_BAD_REQUEST)
#            
#            # Affecter le gagnant et le perdant
#            if winner == match.player_1:
#                match.winner = match.player_1
#                match.loser = match.player_2
#            else:
#                match.winner = match.player_2
#                match.loser = match.player_1
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

class DetailTournamentView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    lookup_field = 'tournament_id'


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
#                    "player_1": match.player_1.username,
#                    "player_2": match.player_2.username,
#                    "status": match.status,
#                    "score_player_1": match.score_player_1,
#                    "score_player_2": match.score_player_2,
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
        
# *********************** PUT / PATCH ************************ #

class PoolMatchesView(APIView):
    def get(self, request, tournament_id, pool_name, format=None):
        try:
            tournament = Tournament.objects.get(tournament_id=tournament_id)
            pool = tournament.pools.get(name=pool_name)
            matches = pool.get_matches()

            match_data = [
                {
                    "player_1": match.player_1.username,
                    "player_2": match.player_2.username,
                    "status": match.status,
                    "score_player_1": match.score_player_1,
                    "score_player_2": match.score_player_2,
                }
                for match in matches
            ]

            return Response(match_data, status=status.HTTP_200_OK)

        except Tournament.DoesNotExist:
            return Response({"error": "Tournament not found"}, status=status.HTTP_404_NOT_FOUND)
        except Pool.DoesNotExist:
            return Response({"error": "Pool not found"}, status=status.HTTP_404_NOT_FOUND)
        
# *********************** PUT / PATCH ************************ #

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
                tournament.delete()
                return Response({
                    "message": "Tournament deleted successfully"
                    }, status=status.HTTP_204_NO_CONTENT)
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
