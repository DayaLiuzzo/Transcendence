
from django.urls import path, re_path, include
from auth_app import views

urlpatterns = [
    # path('api/auth/', views.auth_root),
    path('api/auth/', include([
       path('login', views.login),
       path('signup', views.signup),
       path('test_token', views.test_token),
       path('welcome', views.welcome),
    ]))
]
