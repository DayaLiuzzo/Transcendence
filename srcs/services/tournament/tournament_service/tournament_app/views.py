import uuid

from django.db import IntegrityError
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
from .models import User
from .serializers import TournamentSerializer
from .serializers import UserSerializer
from tournament_app.permissions import IsAuth
from tournament_app.permissions import IsTournament
from tournament_app.permissions import IsUsers
from tournament_app.permissions import IsGame
from tournament_app.permissions import IsOwnerAndAuthenticated

def tournament_service_running(request):
    return JsonResponse({"message": "Tournament service is running"})

################################################################
#                                                              #
#                       Tournament views                       #
#                                                              #
################################################################

# ************************** CREATE ************************** #
class CreateTournamentView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer

    def perform_create(self, serializer):
        try:
            # Récupérer les usernames envoyés dans le body
            usernames = self.request.data.get('users', [])

            # Inclure l'utilisateur qui crée le tournoi (l'ID de l'utilisateur actuel)
            user = self.request.user
            if user.username not in usernames:
                usernames.append(user.username)

            # Vérifier que le nombre d'utilisateurs ne dépasse pas 10
            if len(usernames) > 10:
                raise ValidationError("A tournament cannot have more than 10 users.")

            # Vérifier que les utilisateurs existent
            users = []
            for username in usernames:
                try:
                    existing_user = User.objects.get(username=username)
                    users.append(existing_user)
                except User.DoesNotExist:
                    raise ValidationError(f"User with username '{username}' does not exist.")

            # Créer le tournoi avec le statut "waiting"
            tournament = serializer.save(status='waiting')  # Ajouter les utilisateurs au tournoi
            
            tournament.users.set(users)
            tournament.save()

        except Exception as e:
            raise ValidationError({"message": "Error while creating tournament", "error": str(e)})
        
# *************************** READ *************************** #

class ListAllTournamentView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer

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
    
# *********************** PUT / PATCH ************************ #

# class AddUsersToTournamentView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, *args, **kwargs):
#         tournament = Tournament.objects.get(id=kwargs['pk'])

#         # Vérifier que le tournoi est en 'waiting' avant d'ajouter des utilisateurs
#         if tournament.status != 'waiting':
#             return Response({
#                 "message": "Tournament is not in 'waiting' status, cannot add users."
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         users_to_add = request.data.get('users', [])
        
#         if not users_to_add:
#             return Response({
#                 "message": "No users provided."
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         for user_id in users_to_add:
#             user = User.objects.get(id=user_id)
            
#             # Vérifier si l'utilisateur est déjà dans le tournoi
#             if user in tournament.users.all():
#                 return Response({
#                     "message": f"User {user.username} is already in the tournament."
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             tournament.users.add(user)
        
#         tournament.save()
#         return Response({
#             "message": f"Users added successfully to tournament {tournament.name}",
#             "users_added": users_to_add
#         }, status=status.HTTP_200_OK)

# class RemoveUsersFromTournamentView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, *args, **kwargs):
#         tournament = Tournament.objects.get(id=kwargs['pk'])

#         # Vérifier que le tournoi est en 'waiting'
#         if tournament.status != 'waiting':
#             return Response({
#                 "message": "Tournament is not in 'waiting' status, cannot remove users."
#             }, status=status.HTTP_400_BAD_REQUEST)

#         users_to_remove = request.data.get('users', [])
        
#         if not users_to_remove:
#             return Response({
#                 "message": "No users provided."
#             }, status=status.HTTP_400_BAD_REQUEST)

#         for user_id in users_to_remove:
#             user = User.objects.get(id=user_id)
            
#             # Vérifier si l'utilisateur est bien dans le tournoi
#             if user not in tournament.users.all():
#                 return Response({
#                     "message": f"User {user.username} is not part of this tournament."
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             tournament.users.remove(user)

#         tournament.save()
#         return Response({
#             "message": f"Users removed successfully from tournament {tournament.name}",
#             "users_removed": users_to_remove
#         }, status=status.HTTP_200_OK)

class LockTournamentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        tournament = Tournament.objects.get(id=kwargs['pk'])

        if tournament.status == 'waiting':
            tournament.status = 'playing'
            tournament.save()

            return Response({
                "message": "Tournament locked and status changed to 'playing'."
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                "message": "Tournament cannot be locked. Current status is not 'waiting'."
            }, status=status.HTTP_400_BAD_REQUEST)

class FinishTournamentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        tournament = Tournament.objects.get(id=kwargs['pk'])

        if tournament.status == 'playing':
            tournament.status = 'finished'
            tournament.save()

            return Response({
                "message": "Tournament finished and status changed to 'finished'."
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                "message": "Tournament cannot be finished. Current status is not 'playing'."
            }, status=status.HTTP_400_BAD_REQUEST)


# ************************** DELETE ************************** #


class DeleteUserView(generics.DestroyAPIView):
    permission_classes = [IsAuth]
    queryset = User.objects.all().exclude(username="deleted_account")
    serializer_class = UserSerializer
    lookup_field = "username"

    def get_object(self):
        return self.request.user

    def perform_destroy(self, instance):
        # Avant de supprimer l'utilisateur, dissocier les utilisateurs de leur tournoi
        if instance.tournaments.exists():
            for tournament in instance.tournaments.all():
                if instance in tournament.users.all():
                    tournament.users.remove(instance)
                    tournament.players_count -= 1
                    if tournament.players_count < 2:
                        tournament.status = 'waiting'
                    tournament.save()

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
        # Si l'utilisateur est dans une tournament, dissocier la tournament et l'utilisateur
        if instance.tournament:
            tournament = instance.tournament
            if tournament.player1 == instance:
                tournament.player1 = None
            elif tournament.player2 == instance:
                tournament.player2 = None
            
            tournament.players_count -= 1
            if tournament.players_count < 2:
                tournament.status = 'waiting'
            tournament.save()

        instance.delete()