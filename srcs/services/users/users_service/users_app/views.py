from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework import status 
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token



# def api_auth_view(request):
#     return JsonResponse({"message": "Auth API is running"})


# def auth_view(request):
#     return JsonResponse({"message": "Auth service is running"})