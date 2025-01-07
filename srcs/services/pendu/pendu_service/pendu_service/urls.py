from django.urls import include
from django.urls import path
from django.urls import re_path

from pendu_app import views

urlpatterns = [
    path('api/pendu/', include('pendu_app.urls'))
]
