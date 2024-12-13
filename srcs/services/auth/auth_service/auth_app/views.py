
from rest_framework.decorators import api_view
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views import View
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .serializers import  CustomUserSerializer
from .models import CustomUser
from rest_framework.exceptions import ValidationError
from .requests_custom import send_create_requests, send_delete_requests
import requests

@api_view(['GET'])
def get_example(request):
    return Response({"message": "This is a GET endpoint"}, status=status.HTTP_200_OK)

@api_view(['POST'])
def post_example(request):
    data = request.data
    return Response({"received_data": data}, status=status.HTTP_200_OK)

class GetCSRFTokenView(View):
    def get(self, request, *args, **kwargs):
        token = get_token(request)  # Fetches the CSRF token
        return JsonResponse({'csrf_token': token})



class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": "This is a protected view!"})





class SignUpView(generics.ListCreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    lookup_field = 'username'

    def perform_create(self, serializer):
        serializer.is_valid(raise_exception=True)
        username = serializer.validated_data.get('username')
        req_urls = [ 'http://users:8000/api/users/create/',
                    ]
        if send_create_requests(urls=req_urls, body={'username':username}) == False:
            raise ValidationError("Error deleting user")
        user = serializer.save()
        return user

class DeleteUserView (generics.DestroyAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    lookup_field = 'username'

    def perform_destroy(self, instance):
        req_urls = [ f'http://users:8000/api/users/{instance.username}/delete/',
                    ]
        if send_delete_requests(urls=req_urls, body={'username': instance.username}) == False:
            raise ValidationError("Error deleting user")
        instance.delete()