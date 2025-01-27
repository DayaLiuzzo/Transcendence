from rest_framework import serializers
from PIL import Image
import io

class UserAvatarSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=True)
    avatar_name = serializers.CharField(read_only=True)
    def validate_avatar(self, value):
        try:
            image = Image.open(value)
            image.verify()
        except (IOError, SyntaxError) as e:
            raise serializers.ValidationError("The uploaded file is not a valid image.")
        if image.format not in ['JPEG', 'PNG', 'JPG']
            raise serializers.ValidationError("The uploaded image has wrong format")
        max_size = 5* 1024 * 1024
        if image.size > max_size:
            raise serializers.ValidationError("The image file size is too large")
        return value