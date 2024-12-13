
from django.urls import path, re_path, include
from auth_app import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from auth_app.views import GetCSRFTokenView, CustomTokenObtainPairView

urlpatterns = [
    # path('api/auth/', views.auth_root),
    path('api/auth/', include([
        path('welcome/', views.welcome),
        path('post_example/', views.post_example),
        path('get_example/', GetCSRFTokenView.as_view(), name='get_csrf_token'),
        path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
        path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
        path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
        path('protected/', views.ProtectedView.as_view(), name='protected_view'),
        path('signup/', views.SignUpView.as_view(), name='signup'),
        path('delete/<str:username>/', views.DeleteUserView.as_view(), name='delete')
    ]))
]
