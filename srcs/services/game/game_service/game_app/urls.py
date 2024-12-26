from django.urls import path
from game_app import views

urlpatterns = [
		path('', views.index, name='index'),#homepage
		path('test/', views.test, name='test'),
		# path('grr/', views.grr, name='grr'),
		path('<str:room_name>/', views.gameroom, name='room'),
]