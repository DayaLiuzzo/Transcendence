# from django.shortcuts import render

# # Create your views here.

from django.http import HttpResponse
from django.shortcuts import render

def stawr(request):
    return HttpResponse('<h1>Hello ma stawrrrrrrrr!</h1>')