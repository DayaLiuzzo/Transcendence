from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework import status 
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model


@csrf_exempt
@api_view(['POST'])
def login(request):
    user = get_object_or_404(get_user_model(), username=request.data['username'])
    
    if not user.check_password(request.data['password']):
        return Response({'detail': 'Not found.'}, status=status.HTTP_400_BAD_REQUEST)
    
    token, created = Token.objects.get_or_create(user=user)
    serializer = UserSerializer(instance=user)
    
    # Create response with token in cookie
    response = JsonResponse({
        "message": "Login successful",
        "user": serializer.data
    })
    # Set the token in the cookie (remember to use Secure in production with HTTPS)
    response.set_cookie(
        'auth_token', token.key, httponly=True, secure=False, samesite='None', path='/'
    )
    return response

# Signup view with token in a cookie
@csrf_exempt
@api_view(['POST'])
def signup(request):
    serializer = UserSerializer(data=request.data)
    print("Requête reçue avec données :", request.data)

    if serializer.is_valid():
        serializer.save()
        user = get_user_model().objects.get(username=serializer.data['username'])
        user.set_password(request.data['password'])
        user.save()
        print("1")

        token = Token.objects.create(user=user)
        
        # Create response with token in cookie
        response = JsonResponse({
            'message': 'Signup successful',
            'user': serializer.data
        })
        print("2")

        # Set the token in the cookie
        response.set_cookie(
            'auth_token', token.key, domain='localhost', httponly=True, secure=False, samesite='None', path='/'
        )
        print(f"Set cookie: auth_token={token.key}")
        return response
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['GET'])
def welcome(request):
    user_data = {
        'id': 99,
        'username': 'Jdoe',
        'password': 'strongpwd',
        'email': 'johndoe@gmail.com'
    }
    
    # Sérialiser les données utilisateur
    serializer = UserSerializer(data=user_data)
    
    if serializer.is_valid():
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def test_token(request):
    return Response("passed for{}".format(request.user.email))



# def api_auth_view(request):
#     return JsonResponse({"message": "Auth API is running"})


# def auth_view(request):
#     return JsonResponse({"message": "Auth service is running"})