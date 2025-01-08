from django.http import JsonResponse

def api_service_running(request):
    return JsonResponse({"message": "API gateway service is running"})