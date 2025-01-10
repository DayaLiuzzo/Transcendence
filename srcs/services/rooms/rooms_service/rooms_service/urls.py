from django.urls import include
from django.urls import path
from django.urls import re_path

from rooms_app import views

urlpatterns = [
    path('api/rooms/', include([
        path('test/', views.rooms_service_running, name='rooms_home'),
        path('join_or_create/', views.join_or_create_room, name='join_or_create_room'),
        path('create/', views.CreateUserView.as_view(), name='create_user'),
        path('', views.get_rooms, name='get_rooms'),
    ]))
]