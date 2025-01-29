from rest_framework import serializers
from PIL import Image

class UserAvatarSerializer(serializers.Serializer):
    avatar = serializers.ImageField(required=True)
    avatar_name = serializers.CharField(read_only=True)

    def validate_avatar(self, value):
        try:
            image = Image.open(value)
            image.verify()  # Verify integrity, but this closes the file
            value.seek(0)   # Reset file pointer
            image = Image.open(value)  # Reopen for format check
        except (IOError, SyntaxError):
            raise serializers.ValidationError("The uploaded file is not a valid image.")

        if image.format not in ['JPEG', 'PNG']:  # PIL returns "JPEG", not "JPG"
            raise serializers.ValidationError("The uploaded image has wrong format")

        max_size = 5 * 1024 * 1024  # 5MB limit
        if value.size > max_size:
            raise serializers.ValidationError("The image file size is too large")

        return value
