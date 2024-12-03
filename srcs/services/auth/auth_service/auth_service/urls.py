
from django.urls import path, re_path, include
from auth_app import views

urlpatterns = [
    path('api/auth/', views.auth_root),
    path('api/auth/', include([
        re_path('login', views.login),
        re_path('signup', views.signup),
        re_path('test_token', views.test_token),
        re_path('welcome', views.welcome),
    ]))
]
