from django.urls import include
from django.urls import path
from django.urls import re_path

from users_app import views

urlpatterns = [
    path('api/users/', include([
        path('create/', views.CreateUserProfileView.as_view(), name='create_user_profile'),
        path('get/', views.get_example, name='get_example'),
        path('delete/<str:username>/', views.DeleteUserProfileView.as_view(), name='delete_user_profile'),
        path('update/<str:username>/', views.UpdateUserProfileView.as_view(), name='update_user_profile'),
        path('test', views.TestServiceCommunicationView.as_view(), name='test'),  
        path('protected/service/', views.ProtectedServiceView.as_view(), name='protected_view'),
        path('protected/user/', views.ProtectedUserView.as_view(), name='protected_view'),
        path('<str:username>/', views.RetrieveUserProfile.as_view(), name='user_profile'),
        path('<str:username>/friends/add/<str:friendusername>/', views.AddFriendView.as_view(), name='add_friend'),
        path('<str:username>/friends/remove/<str:friendusername>/', views.RemoveFriendView.as_view(), name='remove_friend'),
        path('<str:username>/friends/', views.ListFriendsView.as_view(), name='list_friend'),
        path('<str:username>/avatar/', views.AvatarView.as_view(), name='avatar'),
        path('<str:username>/avatar/update/', views.AvatarUpdateView.as_view(), name='avatar-udate'),
    ]))

]