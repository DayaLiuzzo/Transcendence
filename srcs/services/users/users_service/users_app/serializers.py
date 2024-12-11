from rest_framework import serializers
from .models import UserProfile

from rest_framework import serializers
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['pseudo', 'biography']
    
    def validate(self, data):
        """Check for extra fields in the request."""
        allowed_fields = set(self.fields.keys())
        request_fields = set(self.initial_data.keys())  # `initial_data` contains the raw input
        extra_fields = request_fields - allowed_fields
        
        if extra_fields:
            raise serializers.ValidationError(
                {"detail": f"Extra fields not allowed: {', '.join(extra_fields)}"}
            )
        return data

    def validate_pseudo(self, value):
        """Check that the pseudo is unique."""
        if UserProfile.objects.filter(pseudo=value).exists():
            raise serializers.ValidationError("This pseudo already exists.")
        return value
    
    def create(self, validated_data):
        return UserProfile.objects.create(**validated_data)