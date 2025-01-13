import logging

from django.contrib.auth.models import User
from django.db import IntegrityError
from django.shortcuts import get_object_or_404

from rest_framework import generics
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.authentication import SessionAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view
from rest_framework.decorators import authentication_classes
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .authentication import CustomJWTAuth
from .models import UserProfile
from .serializers import UserProfileSerializer
from users_app.permissions import IsService
from users_app.permissions import IsOwnerAndAuthenticated

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    # filename="basic.log",
    )

# Crée un logger spécifique au module courant
logger = logging.getLogger(__name__)

@api_view(['GET'])
def get_example(request):
    return Response({"message": "This is a GET endpoint"}, status=status.HTTP_200_OK)

class CreateUserProfileView(generics.CreateAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer


class DeleteUserProfileView(generics.DestroyAPIView):
    permission_classes = [IsOwnerAndAuthenticated, IsService]
    queryset = UserProfile.objects.all().exclude(username="deleted_account")
    serializer_class = UserProfileSerializer
    lookup_field = "username"

class RetrieveUserProfile(generics.RetrieveAPIView):
    permission_classes = [IsOwnerAndAuthenticated,IsService]
    queryset = UserProfile.objects.all().exclude(username="deleted_account")
    serializer_class = UserProfileSerializer
    lookup_field = "username"


class ProtectedServiceView(APIView):
    authentication_classes = []
    permission_classes = [IsService]
    def get(self, request):
        user = request.user
        logger.debug(f"Authenticated user in view: {user}")
        return Response({"message": "Service is Authenticated"})
    
class ProtectedUserView(APIView):
    permission_classes = [IsOwnerAndAuthenticated]
    def get(self, request):
        user = request.user
        logger.debug(f"Authenticated user in view: {user}")
        return Response({"message": "User is Owner and Authenticated!"})