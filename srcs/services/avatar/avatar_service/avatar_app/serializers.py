from rest_framework import serializers
from PIL import Image

class UserAvatarSerializer(serializers.Serializer):
    avatar = serializers.ImageField(required=True)
    avatar_type = serializers.CharField(read_only=True)

    def validate_avatar(self, value):
        try:
            image = Image.open(value)
            image.verify()  
            value.seek(0)   
            image = Image.open(value) 
        except (IOError, SyntaxError):
            raise serializers.ValidationError("The uploaded file is not a valid image.")

        if image.format not in ['JPEG', 'PNG', 'JPG']:  # PIL returns "JPEG", not "JPG"
            raise serializers.ValidationError("The uploaded image has wrong format")
        
        self.context['avatar_type'] = image.format.lower() 
        
        max_size = 5 * 1024 * 1024  # 5MB limit
        if value.size > max_size:
            raise serializers.ValidationError("The image file size is too large")

        return value
    
    def create(self, validated_data):
        avatar_type = self.context.get('avatar_type')
        validated_data['avatar_type'] = avatar_type
        return validated_data
