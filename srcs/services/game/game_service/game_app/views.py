from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework import status 
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from django.shortcuts import render

def index(request):
    return render(request, 'index.html', {})

def gameroom(request, room_name):
    return render(request, 'gameroom.html', {
        'room_name': room_name
    })