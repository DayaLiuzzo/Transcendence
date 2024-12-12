
from django.urls import re_path, path, include
from users_app import views

urlpatterns = [
    path('api/users/', include([
        path('create/', views.CreateUserProfileView.as_view(), name='create_user_profile'),
    ]))

]