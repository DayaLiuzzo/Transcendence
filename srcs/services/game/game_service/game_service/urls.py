from django.urls import include
from django.urls import path
from django.urls import re_path

from game_app import views

urlpatterns = [
    path('api/game/', include('game_app.urls')),
    
]
