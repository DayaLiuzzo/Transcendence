from django.urls import include
from django.urls import path
from django.urls import re_path

from rooms_app import views

urlpatterns = [
    path('api/rooms/', include([
        path('test/', views.rooms_service_running, name='rooms_home'),
        
        path('create_room/', views.CreateRoomView.as_view(), name='create_room'),
        path('join_room/', views.JoinRoomView.as_view(), name='join_room'),
        path('quit-room/', views.QuitRoomView.as_view(), name='quit_room'),
        path('list_my_finished_rooms/', views.ListMyFinishedRoomsView.as_view(), name='list_my_finished_room'),
        path('list_all_rooms/', views.ListAllRoomsView.as_view(), name='list_room'),
        path('list_available_rooms/', views.ListAvailableRoomsView.as_view(), name='list_room'),
        path('list_locked_rooms/', views.ListLockedRoomsView.as_view(), name='list_room'),
        path('count_all_rooms/', views.CountAllRoomsView.as_view(), name='count_all_rooms'),
        path('count_available_rooms/', views.CountAvailableRoomsView.as_view(), name='count_available_rooms'),
        path('count_locked_rooms/', views.CountLockedRoomsView.as_view(), name='count_locked_rooms'),
        path('delete_room/<str:room_id>/', views.DeleteRoomView.as_view(), name='delete_room'),
        path('update_room/<str:room_id>/', views.UpdateRoomView.as_view(), name='delete_room'),
        path('user_stats/', views.UserStats.as_view(), name='user_stats'),
        path('create/', views.CreateUserView.as_view(), name='create_user'),
        # path('list/', views.ListUserView.as_view(), name='list_user'),
        path('update/<str:username>/', views.UpdateUserProfileView.as_view(), name='update_user'),
        path('delete/<str:username>/', views.DeleteUserView.as_view(), name='delete_user'), #username a rajouter dans l'url
    ]))
]
