
from django.contrib.auth import authenticate

from rest_framework import generics
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import api_view
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

import pyotp
from .models import CustomUser
from .permissions import IsOwnerAndAuthenticated
from .permissions import IsOwner
from .permissions import IsAuthenticated
from .serializers import CustomUserSerializer
from .serializers import CustomTokenObtainPairSerializer
from .serializers import ServiceTokenSerializer
from .serializers import TwoFactorSetupSerializer
from .serializers import TwoFactorVerifySerializer
from .requests_custom import *


# ================================================
# =============== AUTH VIEWS =====================
# ================================================

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer 

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        otp = request.data.get('otp')

        if not username or not password:
            return Response({"error": "Please provide both username and password"}, status=status.HTTP_400_BAD_REQUEST)
        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        if user.two_factor_enabled:
            if not otp:
                return Response({"error": "OTP is required for 2FA-enabled accounts."}, status=status.HTTP_400_BAD_REQUEST)
            totp = pyotp.TOTP(user.otp_secret)
            if not totp.verify(otp):
                return Response({"error": "Invalid OTP."}, status=status.HTTP_401_UNAUTHORIZED)
        token = CustomTokenObtainPairSerializer.get_token(user)
        access_token = str(token.access_token)
        refresh_token = str(token)
        return Response({"access_token": access_token, "refresh_token": refresh_token}, status=status.HTTP_200_OK)



# ================================================
# =============== 2FA VIEWS ======================
# ================================================

class TwoFactorSetupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        serializer = TwoFactorSetupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if serializer.validated_data.get('enable'):
            user.otp_secret = pyotp.random_base32()
            user.two_factor_enabled = True
            user.save()
            return Response(TwoFactorSetupSerializer(user).data, status=status.HTTP_200_OK)
        user.two_factor_enabled = False
        user.otp_secret = None
        user.save()
        return Response({"message": "2FA disabled."}, status=status.HTTP_200_OK)


class TwoFactorVerifyView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = TwoFactorVerifySerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = request.user
        user.two_factor_enabled = True
        user.save()
        return Response({"message": "2FA setup verified and enabled."}, status=status.HTTP_200_OK)



# ================================================
# =============== USER VIEWS =====================
# ================================================

### Create User

class SignUpView(generics.CreateAPIView):
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
    permission_classes = [IsOwner]
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    lookup_field = 'username'

    def perform_destroy(self, instance):
        req_urls = [ f'http://users:8443/api/users/delete/{instance.username}/',
                    f'http://game:8443/api/game/delete/{instance.username}/',
                    ]
        if send_delete_requests(urls=req_urls, body={'username': instance.username}) == False:
            raise ValidationError("Error deleting user")
        instance.delete()

class UpdateUserView(generics.UpdateAPIView):
    permission_classes = [IsOwnerAndAuthenticated]
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    lookup_field = 'username'

    def update(self, request, *args, **kwargs):
        try:   
            user = self.get_object()
            old_username = user.username
            new_username = request.data.get('new_username')
            req_urls = [ f'http://users:8443/api/users/update/{old_username}/',
                        f'http://avatar:8443/api/avatar/',
                        ]
            if send_update_requests(urls=req_urls, body={'username': old_username, 'old_username': old_username, 'new_username': new_username}) == False:
                raise ValidationError("Error updating user")
            user.username = new_username
            if user.two_factor_enabled:
                user.otp_secret = pyotp.random_base32()
            user.save()
        except Exception as e:
            raise ValidationError(f"Error updating user bis: {str(e)}")
        if user.two_factor_enabled:
            return Response({"message": "Success", "otp": user.otp_secret }, status=status.HTTP_200_OK)
        return Response({"message": 'Success'}, status=status.HTTP_200_OK)

class RetrieveUserView(generics.RetrieveAPIView):
    permission_classes = [IsOwnerAndAuthenticated]
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    lookup_field = 'username'



# ================================================
# =============== SERVICE VIEWS ==================
# ================================================

class ServiceJWTObtainPair(APIView):
    def post(self, request, *args, **kwargs):
        serializer = ServiceTokenSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
