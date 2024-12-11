from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = UserProfile
        fields = ['pseudo', 'biography']
    
    def create(self, validated_data):
        profile = UserProfile.objects.create(**validated_data)
        return profile

