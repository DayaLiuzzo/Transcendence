from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from .serializers import UserProfileSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.views import APIView
from rest_framework import generics
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from .models import UserProfile
from .authentication import CustomJWTAuth
from django.db import IntegrityError
import logging

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    # filename="basic.log",
    )

# Crée un logger spécifique au module courant
logger = logging.getLogger(__name__)


class CreateUserProfileView(generics.CreateAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer


@api_view(['GET'])
def get_example(request):
    return Response({"message": "This is a GET endpoint"}, status=status.HTTP_200_OK)


class DeleteUserProfileView(generics.DestroyAPIView):
    queryset = UserProfile.objects.all().exclude(username="deleted_account")
    serializer_class = UserProfileSerializer
    lookup_field = "username"

class RetrieveUserProfile(generics.RetrieveAPIView):
    queryset = UserProfile.objects.all().exclude(username="deleted_account")
    serializer_class = UserProfileSerializer
    lookup_field = "username"


class ProtectedView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        logger.debug(f"Authenticated user in view: {user}")
        return Response({"message": "This is a protected view!"})