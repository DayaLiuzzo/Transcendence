from django.urls import include
from django.urls import path
from django.urls import re_path

from rooms_app import views

urlpatterns = [
    path('api/rooms/', include([
        path('test/', views.rooms_service_running, name='rooms_home'),
        
        path('create_room/', views.CreateRoomView.as_view(), name='create_room'),
        path('join_room/', views.JoinRoomView.as_view(), name='join_room'),
        path('list_all_rooms/', views.ListAllRoomsView.as_view(), name='list_room'),
        path('list_available_rooms/', views.ListAvailableRoomsView.as_view(), name='list_room'),
        path('list_locked_rooms/', views.ListLockedRoomsView.as_view(), name='list_room'),
        path('count_all_rooms/', views.CountAllRoomsView.as_view(), name='count_all_rooms'),
        path('count_available_rooms/', views.CountAvailableRoomsView.as_view(), name='count_available_rooms'),
        path('count_locked_rooms/', views.CountLockedRoomsView.as_view(), name='count_locked_rooms'),
        path('delete_room/<str:room_id>/', views.DeleteRoomView.as_view(), name='delete_room'),

        path('create/', views.CreateUserView.as_view(), name='create_user'),
        path('list/', views.ListUserView.as_view(), name='list_user'),
        path('update/', views.UpdateUserView.as_view(), name='update_user'),
        path('delete/', views.DeleteUserView.as_view(), name='delete_user'),
    ]))
]