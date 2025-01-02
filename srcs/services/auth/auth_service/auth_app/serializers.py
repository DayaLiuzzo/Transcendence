from rest_framework import serializers
from django.contrib.auth.hashers import check_password, make_password
from .models import CustomUser, Service, Token
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from datetime import timedelta, datetime
from django.utils.timezone import now
from auth_service import settings
import jwt
from django.utils import timezone
from django.forms import ValidationError

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

class ServiceTokenSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Service
        fields = ['service_name', 'password']
    def validate(self, attrs):
        password = attrs.get('password')
        service_name = attrs.get('service_name')
        try :
            service = Service.objects.get(service_name=service_name)
        except Service.DoesNotExist:
            raise ValidationError(f"Service name : {service_name} does not exist")
        if not check_password(password, service.password):
            raise ValidationError(f"password : {password} does not match service.password : {service.password}")
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
