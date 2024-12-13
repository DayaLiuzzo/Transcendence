from django.urls import path
from . import views

urlpatterns = [
	path('', views.index, name='index'),#homepage
	path('<str:room_name>/', views.gameroom, name='room'),
]