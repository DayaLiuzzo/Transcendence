from django.http import JsonResponse

def users_view(request):
    return JsonResponse({"message": "Users service is running"})