from datetime import timedelta
from datetime import datetime

import jwt
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from django.utils import timezone
from django.utils.timezone import now
from django.contrib.auth.hashers import check_password
from django.contrib.auth.hashers import make_password
from django.forms import ValidationError
import logging

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    # filename="basic.log",
    )

# Crée un logger spécifique au module courant
logger = logging.getLogger(__name__)


from .models import CustomUser
from .models import Service
from .models import Token
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
