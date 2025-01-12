import logging

from django.http import JsonResponse
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.shortcuts import render

from rest_framework import status 
from rest_framework.decorators import api_view
from rest_framework.decorators import authentication_classes
from rest_framework.decorators import permission_classes
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token

logger = logging.getLogger('game_app')  # Utilisez le logger de votre application spécifique

@api_view(['GET'])
def game_service_running(request):
    return JsonResponse({"message": "Game service is running"})

@api_view(['GET'])
def gameroom(request, room_name):
    data = {'room_name': room_name, 'message': 'Bienvenue dans la salle !'}
    return Response(data, status=status.HTTP_200_OK)