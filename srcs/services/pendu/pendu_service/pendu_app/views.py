import logging
import requests

from django.shortcuts import get_object_or_404
from django.shortcuts import render
from django.contrib.auth.models import User

from rest_framework import status 
from rest_framework.decorators import api_view
from rest_framework.decorators import authentication_classes
from rest_framework.decorators import permission_classes
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token

logger = logging.getLogger('pendu_app')  # Utilisez le logger de votre application spécifique

@api_view(['GET'])
def test(request):
    logger.debug(f"*********************************************")
    logger.debug(f"Client attempting a test")
    return Response({"message": "Hello le jeu"}, status=status.HTTP_200_OK)


@api_view(['GET'])
def word(request):
    logger.debug(f"*********************************************")
    logger.debug(f"Generating a random word")
    response = requests.get("https://random-word-api.herokuapp.com/word?length=10")
    if response.status_code == 200:
        word=response.json()
    #penser a lever une exception genre mot unavailable
    logger.debug(f"Le mot est : {word}")
    return Response({"message": f"Le mot est {word}"}, status=status.HTTP_200_OK)


        


# @api_view(['GET'])
# def grr(request):
#     return Response({"message": "asgdsegdddd"}, status=status.HTTP_200_OK)

@api_view(['GET'])
def index(request):
    return Response({"message": "asgdsegdddd"}, status=status.HTTP_200_OK)
    # return render(request, 'index.html', {}, status=status.HTTP_200_OK)

@api_view(['GET'])
def penduroom(request, room_name):
    logger.debug(f"*********************************************")
    logger.debug(f"Client attempting to connect to room via API")
    # Retourner les données sous forme de JSON
    data = {
        'room_name': room_name,
        'message': 'Bienvenue dans la salle !'
    }
    return Response(data, status=status.HTTP_200_OK)