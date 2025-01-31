from django.urls import include
from django.urls import path
from django.urls import re_path

from game_app import views

urlpatterns = [
        path('test/', views.game_service_running, name='game_home'),#homepage

        path('gamestate/', views.GameStateAPIView.as_view(), name='get_game_updates'),
        path('<str:room_id>/', views.JoinGame.as_view(), name='join_game'),
        path('create_game/<str:room_id>/', views.CreateGame.as_view(), name='create_game'),
        path('delete_game/<str:room_id>/', views.DeleteGame.as_view(), name='delete_game'),  # Ajouter cette ligne
        #maybe changer en /list/all... a voir
        path('list_all_games/', views.GameListAPIView.as_view(), name='list_games'),  # Ajouter cette ligne
        # path('<str:room_name>/', views.gameroom, name='room'),
        
        path('create/', views.CreateUserView.as_view(), name='create_user'),
        path('delete/', views.DeleteUserView.as_view(), name='delete_user'), 
        
        # path('protected/service/', views.ProtectedServiceView.as_view(), name='protected_view'),
        # path('protected/user/', views.ProtectedUserView.as_view(), name='protected_view'),
  
]