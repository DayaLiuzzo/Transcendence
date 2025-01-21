from rest_framework import serializers

from .models import CustomUser

class CustomUserSerializer(serializers.ModelSerializer):
    biography = serializers.CharField(default="Default biography", required=False)
    class Meta:
        model = CustomUser
        fields = ['username', 'biography']

