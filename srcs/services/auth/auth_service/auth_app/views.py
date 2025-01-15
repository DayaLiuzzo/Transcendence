
from django.contrib.auth import authenticate
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views import View

import requests
from rest_framework import generics
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
import logging 

from .models import CustomUser
from .permissions import IsOwnerAndAuthenticated, IsService
from .serializers import CustomUserSerializer
from .serializers import CustomTokenObtainPairSerializer
from .serializers import ServiceTokenSerializer
from .requests_custom import *


logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    # filename="basic.log",
    )

# Crée un logger spécifique au module courant
logger = logging.getLogger(__name__)

logger.debug("------------------CALL-----------")


@api_view(['GET'])
def welcome(request):
    return Response({"message": "Hello World"}, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_example(request):
    return Response({"message": "This is a GET endpoint"}, status=status.HTTP_200_OK)

@api_view(['POST'])
def post_example(request):
    data = request.data
    return Response({"received_data": data}, status=status.HTTP_200_OK)

class GetCSRFTokenView(View):
    def get(self, request, *args, **kwargs):
        token = get_token(request)  # Fetches the CSRF token
        return JsonResponse({'csrf_token': token})


class ProtectedUserView(APIView):
    permission_classes = [IsService]
    def get(self, request):
        user = request.user
        print("Authenticated user in view:", user)  # Debugging: Log the authenticated user
        return Response({"message": "This is a protected view!"})
    
class ProtectedServiceView(APIView):
    authentication_classes = []
    permission_classes = [IsService]
    def get(self, request):
        user = request.user
        print("Authenticated user in view:", user)  # Debugging: Log the authenticated user
        return Response({"message": "This is a protected view!"})


class SignUpView(generics.ListCreateAPIView):
    logger.debug("IN AUTH CREATE VIEW")
    permission_classes = [AllowAny]
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    lookup_field = 'username'

    def perform_create(self, serializer):
        serializer.is_valid(raise_exception=True)
        username = serializer.validated_data.get('username')
        req_urls = [ 'http://users:8443/api/users/create/',
                    'http://game:8443/api/game/create/'
                    ]
        if send_create_requests(urls=req_urls, body={'username':username}) == False:
            raise ValidationError("Error deleting user")
        user = serializer.save()
        return user

class DeleteUserView (generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    lookup_field = 'username'
    logger.debug("IN AUTH DELETE VIEW")

    def perform_destroy(self, instance):
        req_urls = [ f'http://users:8443/api/users/delete/{instance.username}/',
                    f'http://game:8443/api/game/delete/{instance.username}/',
                    ]
        if send_delete_requests(urls=req_urls, body={'username': instance.username}) == False:
            raise ValidationError("Error deleting user")
        logger.debug(f'user deleted : {instance.username}')
        instance.delete()

class RetrieveUserView(generics.RetrieveAPIView):
    permission_classes = [IsOwnerAndAuthenticated]
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    lookup_field = 'username'


class ServiceJWTObtainPair(APIView):
    def post(self, request, *args, **kwargs):
        serializer = ServiceTokenSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        if not username or not password:
            return Response({"error": "Please provide both username and password"}, status=status.HTTP_400_BAD_REQUEST)
        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        token = CustomTokenObtainPairSerializer.get_token(user)
        access_token = str(token.access_token)
        refresh_token = str(token)
        return Response({"access_token": access_token, "refresh_token": refresh_token}, status=status.HTTP_200_OK)