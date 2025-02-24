
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from django.utils.timezone import now
from django.contrib.auth.hashers import check_password
from django.contrib.auth.hashers import make_password
from datetime import timedelta
from datetime import datetime

import jwt
import pyotp

from .models import CustomUser
from .models import Service

from auth_service import settings

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
        return custom_password_validator(value)
        
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
        token.payload['exp'] = datetime.utcnow() + timedelta(hours=12)
        user.last_log = now()
        user.save()
        return token


class ServiceTokenSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Service
        fields = ['service_name', 'password']

    def validate(self, attrs):
        service_name = attrs.get('service_name')
        password = attrs.get('password')

        service = Service.objects.filter(service_name=service_name).first()
        if not service:
            raise serializers.ValidationError({"service_name": f"Service name '{service_name}' does not exist."})

        if not check_password(password, service.password):
            raise serializers.ValidationError({"password": f"{password} does not match {service.password} Invalid password."})
        token = createServiceToken(service)
        return {'token': token}

def createServiceToken(service):
    payload = {
        'service_name': str(service.service_name),
        'exp': datetime.utcnow() + timedelta(hours=12),
        'iat': datetime.utcnow(),
    }
    token = jwt.encode(payload, settings.SIMPLE_JWT['SIGNING_KEY'], algorithm='RS256')
    return token

class TwoFactorSetupSerializer(serializers.Serializer):
    enable = serializers.BooleanField()

    def to_representation(self, instance):
        otp_secret = instance.otp_secret
        otp_uri = pyotp.totp.TOTP(otp_secret).provisioning_uri(
            name=f"{instance.username}",
            issuer_name="auth_app"
        )
        return {
            "message": "2FA enabled. Use this secret to configure your authenticator app.",
            "otp_secret": otp_secret,
            "qr_code_url": otp_uri
        }


class TwoFactorVerifySerializer(serializers.Serializer):
    otp = serializers.CharField()

    def validate(self, attrs):
        otp = attrs.get('otp')
        user = self.context['request'].user
        totp = pyotp.TOTP(user.otp_secret)

        if not totp.verify(otp):
            raise serializers.ValidationError({"otp": "Invalid OTP. Please try again."})

        return attrs
    
class ChangePasswordSerializer(serializers.Serializer):
    password = serializers.CharField(max_length=128, required=True, write_only=True)
    new_password = serializers.CharField(max_length=128, required=True, write_only=True)
    new_password2 = serializers.CharField(max_length=128, required=True, write_only=True)

    def validate_password(self, value):
        user = self.context['request'].user
        if not check_password(value, user.password):
            raise serializers.ValidationError("Invalid password.")
        return value

    def validate(self, data):
        new1 = data.get('new_password')
        new2 = data.get('new_password2')
        if data['password'] == new1:
            raise serializers.ValidationError("New password cannot be the same as the old password.")
        if new1 != new2:
            raise serializers.ValidationError("Passwords do not match.")
        custom_password_validator(new1)
        return data
    def update(self, instance, validated_data):
        password = validated_data['new_password']
        instance.set_password(password)
        instance.save()
        return instance

    


def custom_password_validator(value):

    if not value:
        raise serializers.ValidationError("Password cannot be empty.")
    if len(value) < 8:
        raise serializers.ValidationError("Password must be at least 8 characters long.")
    if len(value) > 128:
        raise serializers.ValidationError("Password max len is 128")
    if not any(char.isdigit() for char in value):
        raise serializers.ValidationError("Password must contain at least one digit.")
    if not any(char.isalpha() for char in value):
        raise serializers.ValidationError("Password must contain at least one letter.")
    if not any(char.isupper() for char in value):
        raise serializers.ValidationError("Password must contain at least one uppercase letter.")
    if not any(char.islower() for char in value):
        raise serializers.ValidationError("Password must contain at least one lowercase letter.")
    if not any(char in ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '+', '='] for char in value):
        raise serializers.ValidationError("Password must contain at least one special character.")
    if any(char in [' ', '\t', '\n'] for char in value):
        raise serializers.ValidationError("Password cannot contain whitespace.")
    if any(char in ["'", '"', '`', '~', '\\', '/', '|', '.', ':', ';'] for char in value):
        raise serializers.ValidationError("Password cannot contain special characters.")
    return value
    