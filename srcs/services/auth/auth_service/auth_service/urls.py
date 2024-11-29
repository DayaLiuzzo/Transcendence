
from django.urls import re_path, include
from auth_app import views

urlpatterns = [
    path('/api/auth/', include([
        re_path('login', views.login),
        re_path('signup', views.signup),
        re_path('test_token', views.test_token),
        re_path('welcome', views.welcome),
    ]))
]
