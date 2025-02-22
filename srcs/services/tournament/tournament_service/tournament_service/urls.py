from django.urls import include
from django.urls import path
from django.urls import re_path

from tournament_app import views

urlpatterns = [
    path('api/tournament/', include('tournament_app.urls')),
]