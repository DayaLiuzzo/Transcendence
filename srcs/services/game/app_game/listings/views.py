# from django.shortcuts import render

# # Create your views here.

from django.http import HttpResponse
from django.shortcuts import render

def meuhriah(request):
    return HttpResponse('<h1>Hello meuhriah, its tiiiiiiime!</h1>')
