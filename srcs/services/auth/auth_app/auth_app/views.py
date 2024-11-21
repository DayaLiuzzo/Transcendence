from django.http import JsonResponse

def auth_view(request):
    return JsonResponse({"message": "Auth service is running"})