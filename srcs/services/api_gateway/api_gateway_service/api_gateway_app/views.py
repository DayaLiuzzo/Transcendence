from django.http import JsonResponse

def service_running_view(request):
    return JsonResponse({"message": "API gateway is running"})