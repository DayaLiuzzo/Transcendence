from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import CustomUser
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from datetime import timedelta, datetime
from django.utils.timezone import now

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = CustomUser
        fields = ['username', 'password', 'email']

    def validate_username(self, value):
        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username already exists.")
        return value

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email already exists.")
        return value
    
    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        return value
        
    def create(self, validated_data):
        # Hash the password and create the user
        validated_data['password'] = make_password(validated_data['password'])
        user = CustomUser.objects.create(**validated_data)

        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        # del token['user_id']
        token.set_exp(lifetime=timedelta(minutes=5))
        token.payload['exp'] = (datetime.utcnow() + timedelta(days=1)).timestamp()
        user.last_log = now()
        user.save()
        return token