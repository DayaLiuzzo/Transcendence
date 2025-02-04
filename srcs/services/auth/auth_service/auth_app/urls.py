from django.urls import include
from django.urls import path

from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.views import TokenBlacklistView
from auth_app import views
from auth_app.views import CustomTokenObtainPairView, TwoFactorSetupView, TwoFactorVerifyView



urlpatterns = [
    # path('api/auth/', views.auth_root),
        path('refresh/', TokenRefreshView.as_view() , name='auth-refresh'),
        path('logout/', TokenBlacklistView.as_view(), name='auth-logout'),
        path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
        path('signup/', views.SignUpView.as_view(), name='signup'),
        path('delete/<str:username>/', views.DeleteUserView.as_view(), name='delete'),
        path('service-token/', views.ServiceJWTObtainPair.as_view(), name='create-service-token'),
        path('<str:username>/', views.RetrieveUserView.as_view(), name='user_auth'),
        path('2fa/setup/', TwoFactorSetupView.as_view(), name='two_factor_setup'),
        path('2fa/verify/', TwoFactorVerifyView.as_view(), name='two_factor_verify'),

]