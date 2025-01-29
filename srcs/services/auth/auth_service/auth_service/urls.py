from django.urls import include
from django.urls import path

from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.views import TokenBlacklistView
from auth_app import views
from auth_app.views import CustomTokenObtainPairView, TwoFactorSetupView, TwoFactorVerifyView

urlpatterns = [
    # path('api/auth/', views.auth_root),
    path('api/auth/', include('auth_app.urls')),
]