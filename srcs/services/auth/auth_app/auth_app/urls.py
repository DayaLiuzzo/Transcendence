
from django.contrib import admin
from django.urls import path, include
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework import routers

urlpatterns = [
    path('api/auth/admin/', admin.site.urls),
    path('auth/', views.auth_view, name='auth'),
    path('api/auth/', include('rest_framework.urls')),
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
