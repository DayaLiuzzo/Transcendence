from django.http import JsonResponse

def friends_view(request):
    return JsonResponse({"message": "API gateway is running"})