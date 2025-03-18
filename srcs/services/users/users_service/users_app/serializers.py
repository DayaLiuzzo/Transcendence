from rest_framework import serializers

from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    biography = serializers.CharField(default="Default biography", required=False)
    class Meta:
        model = UserProfile
        fields = ['username', 'biography', 'last_seen', 'wins', 'losses']

class FriendsSerializer(serializers.ModelSerializer):
    is_online = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['username', 'biography', 'is_online']

    def get_is_online(self, obj):
        return obj.is_online() 