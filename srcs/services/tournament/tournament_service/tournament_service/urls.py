from django.urls import include
from django.urls import path
from django.urls import re_path

from tournament_app import views

urlpatterns = [
    path('api/tournament/', include([
        path('test/', views.tournament_service_running, name='tournament_home'),
        
        path('create_tournament/', views.CreateTournamentView.as_view(), name='create-tournament'),
        # path('<int:pk>/add-users/', views.AddUsersToTournamentView.as_view(), name='add-users-to-tournament'),
        # path('<int:pk>/remove-users/', views.RemoveUsersFromTournamentView.as_view(), name='remove-users-from-tournament'),
        # path('<int:pk>/delete/', views.DeleteTournamentView.as_view(), name='delete-tournament'),
        path('<int:pk>/lock/', views.LockTournamentView.as_view(), name='lock-tournament'),
        path('<int:pk>/finish/', views.FinishTournamentView.as_view(), name='finish-tournament'),
      
        path('list/', views.ListAllTournamentView.as_view(), name='list_all_tournament'),
        path('list/waiting/', views.ListWaitingTournamentView.as_view(), name='list_waiting_tournament'),
        path('list/playing/', views.ListPlayingTournamentView.as_view(), name='list_playing_tournament'),
        path('list/finished/', views.ListFinishedTournamentView.as_view(), name='list_finished_tournament'),
        path('count/', views.CountAllTournamentView.as_view(), name='count_all_tournament'),
        path('count/waiting/', views.CountWaitingTournamentView.as_view(), name='count_waiting_tournament'),
        path('count/playing/', views.CountPlayingTournamentView.as_view(), name='count_playing_tournament'),
        path('count/finished/', views.CountFinishedTournamentView.as_view(), name='count_finished_tournament'),
     
        path('create/', views.CreateUserView.as_view(), name='create_user'),
        # path('list/', views.ListUserView.as_view(), name='list_user'),
        # path('update/', views.UpdateUserView.as_view(), name='update_user'),
        path('delete/', views.DeleteUserView.as_view(), name='delete_user'),
    ]))
]