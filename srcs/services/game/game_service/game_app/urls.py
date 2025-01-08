import logging

from django.urls import path

from game_app import views

urlpatterns = [
		path('', views.game_service_running, name='game_home'),#homepage
		path('<str:room_name>/', views.gameroom, name='room'),
]