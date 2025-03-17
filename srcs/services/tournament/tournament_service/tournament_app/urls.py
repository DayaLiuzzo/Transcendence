from django.urls import path

from tournament_app import views

urlpatterns = [
    path('test/', views.tournament_service_running, name='tournament_home'),

    path('create_tournament/', views.CreateTournamentView.as_view(), name='create-tournament'),
    path('delete_tournament/', views.DeleteTournamentView().as_view(), name='delete-tournament'),

    path('join/<uuid:tournament_id>/', views.JoinTournamentView().as_view(), name='join-tournament'),
    path('leave/', views.LeaveTournamentView().as_view(), name='leave-tournament'),

    path('launch/', views.LaunchTournamentView().as_view(), name='launch-tournament'),

    path('detail/<uuid:tournament_id>/', views.DetailTournamentView().as_view(), name='detail-tournament'),
    path('my_tournament/', views.MyTournamentView().as_view(), name='my-tournament'),

    #path('<uuid:tournament_id>/ranking/', views.TournamentStatsView.as_view(), name='tournament_stats'),
    path('list/', views.ListAllTournamentView.as_view(), name='list_all_tournament'),

    path('room_result/<str:room_id>/', views.SetRoomResultView.as_view(), name='set-room-result'),
    path('get_room_result/<str:room_id>/', views.GetRoomResultView.as_view(), name='get-room-result'),
    path('list_my_rooms/', views.ListMyRoomsView.as_view(), name='list-my-rooms'),
    path('list_pools/<uuid:tournament_id>/', views.ListPoolsView.as_view(), name='list-pools'),
    path('list_rooms_pool/', views.ListRoomsPoolView.as_view(), name='list-rooms-pool'),
    path('list_history/', views.ListTournamentHistoryView.as_view(), name='list-tournament-history'),
    #path('list/waiting/', views.ListWaitingTournamentView.as_view(), name='list_waiting_tournament'),
    #path('list/playing/', views.ListPlayingTournamentView.as_view(), name='list_playing_tournament'),
    #path('list/finished/', views.ListFinishedTournamentView.as_view(), name='list_finished_tournament'),
    #path('count/', views.CountAllTournamentView.as_view(), name='count_all_tournament'),
    #path('count/waiting/', views.CountWaitingTournamentView.as_view(), name='count_waiting_tournament'),
    #path('count/playing/', views.CountPlayingTournamentView.as_view(), name='count_playing_tournament'),
    #path('count/finished/', views.CountFinishedTournamentView.as_view(), name='count_finished_tournament'),
    #path('<uuid:tournament_id>/ranking/', views.TournamentStatsView.as_view(), name='tournament-ranking'),
    path('create/', views.CreateUserView.as_view(), name='create_user'),
    path('update/<str:username>/', views.UpdateUserProfileView.as_view(), name='update_user'),
    # path('list/', views.ListUserView.as_view(), name='list_user'),
    path('delete/<str:username>/', views.DeleteUserView.as_view(), name='delete_user'), #a update pour inclure le username
]
