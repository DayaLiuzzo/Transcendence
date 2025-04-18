from django.urls import include
from django.urls import path
from django.urls import re_path

from users_app import views

urlpatterns = [
    path('api/users/', include([
        path('create/', views.CreateUserProfileView.as_view(), name='create_user_profile'),
        path('update/<str:username>/', views.UpdateUserProfileView.as_view(), name='update_user_profile'),
        path('status/<str:username>/', views.UserStatusView.as_view(), name='user_status'),
        path('update_last_seen/<str:username>/', views.UpdateLastSeenView.as_view(), name='update_last_seen'),
        path('<str:username>/', views.RetrieveUserProfile.as_view(), name='user_profile'),
        path('<str:username>/friends/add/<str:friendusername>/', views.AddFriendView.as_view(), name='add_friend'),
        path('<str:username>/friends/remove/<str:friendusername>/', views.RemoveFriendView.as_view(), name='remove_friend'),
        path('<str:username>/friends/', views.ListFriendsView.as_view(), name='list_friend'),
        path('<str:username>/avatar/', views.AvatarView.as_view(), name='avatar'),
        path('<str:username>/avatar/update/', views.AvatarUpdateView.as_view(), name='avatar-udate'),
    ]))

]