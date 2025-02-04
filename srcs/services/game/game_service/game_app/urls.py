
from django.urls import path

from game_app import views

urlpatterns = [
		path('', views.game_service_running, name='game_home'),#homepage
        path('test/', views.IsUsersView.as_view(), name='test_internal'), 
        path('protected/service/', views.ProtectedServiceView.as_view(), name='protected_view'),
        path('protected/user/', views.ProtectedUserView.as_view(), name='protected_view'),
        path('create/', views.CreateCustomUserView.as_view(), name='create_user_view'),
        path('delete/<str:username>/', views.DeleteCustomUserView.as_view(), name='delete_user_profile'), 
		path('<str:room_name>/', views.gameroom, name='room'),
]