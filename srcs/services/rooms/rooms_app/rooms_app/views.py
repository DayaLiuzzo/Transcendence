from django.http import JsonResponse

def rooms_view(request):
    return JsonResponse({"message": "Rooms service is running"})