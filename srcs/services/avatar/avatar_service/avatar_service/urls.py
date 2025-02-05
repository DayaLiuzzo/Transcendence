from django.urls import include
from django.urls import path
from django.urls import re_path

from avatar_app import views

urlpatterns = [
    path('api/avatar/', include([
        path('', views.AvatarView.as_view(), name='avatar'),
        path('test/', views.TestView.as_view(), name='avatar'),
    ]))

]