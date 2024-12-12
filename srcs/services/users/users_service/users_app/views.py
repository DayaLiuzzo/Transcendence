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

from django.db import IntegrityError


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