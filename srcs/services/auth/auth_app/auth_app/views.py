from django.http import JsonResponse

def api_auth_view(request):
    return JsonResponse({"message": "Auth API is running"})


def auth_view(request):
    return JsonResponse({"message": "Auth service is running"})