import logging

from django.urls import path

from pendu_app import views

urlpatterns = [
		path('', views.index, name='index'),#homepage
		path('test/', views.test, name='test'),
		path('word/', views.word, name='word'),
		# path('grr/', views.grr, name='grr'),
		path('<str:room_name>/', views.penduroom, name='room'),
]
