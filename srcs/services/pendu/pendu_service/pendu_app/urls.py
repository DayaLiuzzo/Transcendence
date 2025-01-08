import logging

from django.urls import path

from pendu_app import views

urlpatterns = [
		path('', views.pendu_service_running, name='pendu_home'),
		path('word/', views.word, name='word'),
		path('<str:room_name>/', views.penduroom, name='room'),
]
