from django.urls import include
from django.urls import path
from django.urls import re_path

from rooms_app import views

urlpatterns = [
    path('api/rooms/', include([
        path('test/', views.rooms_service_running, name='rooms_home'),
        path('<str:room_id>/join/', views.join_room, name='join_room'),
        path('create/', views.create_room, name='create_room'),
        path('', views.get_rooms, name='get_rooms'),
    ]))
]