from django.http import JsonResponse

def game_view(request):
    return JsonResponse({"message": "Game service is running"})