from rest_framework import serializers

from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    biography = serializers.CharField(default="Default biography", required=False)
    class Meta:
        model = UserProfile
        fields = ['username', 'biography', 'wins', 'losses', 'is_online']

class FriendsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['username', 'biography', 'is_online']