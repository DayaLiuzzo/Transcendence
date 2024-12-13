
from django.urls import re_path, path, include
from game_app import views

urlpatterns = [
    path('api/game/', include('game_app.urls'))
]
