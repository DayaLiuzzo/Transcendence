from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework import status 
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from django.shortcuts import render

@api_view(['GET'])
def test(request):
    return Response({"message": "Hello le jeu"}, status=status.HTTP_200_OK)

# @api_view(['GET'])
# def grr(request):
#     return Response({"message": "asgdsegdddd"}, status=status.HTTP_200_OK)

@api_view(['GET'])
def index(request):
    return Response({"message": "asgdsegdddd"}, status=status.HTTP_200_OK)
    # return render(request, 'index.html', {}, status=status.HTTP_200_OK)

@api_view(['GET'])
def gameroom(request, room_name):
    # Retourner les données sous forme de JSON
    data = {
        'room_name': room_name,
        'message': 'Bienvenue dans la salle !'
    }
    return Response(data, status=status.HTTP_200_OK)