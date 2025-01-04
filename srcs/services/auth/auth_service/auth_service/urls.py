from django.urls import include
from django.urls import path
from django.urls import re_path

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.views import TokenVerifyView

from auth_app import views
from auth_app.views import CustomTokenObtainPairView

urlpatterns = [
    # path('api/auth/', views.auth_root),
    path('api/auth/', include([
        path('welcome/', views.welcome),
        path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
        path('protected/', views.ProtectedView.as_view(), name='protected_view'),
        path('signup/', views.SignUpView.as_view(), name='signup'),
        path('delete/<str:username>/', views.DeleteUserView.as_view(), name='delete'),
        path('service-token/', views.ServiceJWTObtainPair.as_view(), name='create-service-token'),
        path('<str:username>/', views.RetrieveUserView.as_view(), name='user_auth')
    ]))
]
