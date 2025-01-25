from django.urls import include
from django.urls import path
from django.urls import re_path

from users_app import views

urlpatterns = [
    path('api/users/', include([
        path('create/', views.CreateUserProfileView.as_view(), name='create_user_profile'),
        path('get/', views.get_example, name='get_example'),
        path('delete/<str:username>/', views.DeleteUserProfileView.as_view(), name='delete_user_profile'), 
        path('protected/service/', views.ProtectedServiceView.as_view(), name='protected_view'),
        path('protected/user/', views.ProtectedUserView.as_view(), name='protected_view'),
        path('<str:username>/', views.RetrieveUserProfile.as_view(), name='user_profile')
    ]))

]