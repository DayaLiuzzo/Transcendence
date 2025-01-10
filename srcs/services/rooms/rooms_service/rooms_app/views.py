import uuid

from django.shortcuts import get_object_or_404
from django.http import JsonResponse

from .models import Room

def rooms_service_running(request):
    return JsonResponse({"message": "Rooms service is running"})

def get_rooms(request):
    rooms = Room.objects.all().values('room_id', 'players_count', 'status')
    return JsonResponse(list(rooms), safe=False)

def join_room(request, room_id):
    room = get_object_or_404(Room, room_id=room_id)

    # Vérifier si la room est encore en statut 'waiting' et si elle a de la place
    if room.status == 'waiting' and room.players_count < 2:
        # Ajouter le joueur à la room
        room.players_count += 1
        room.save()

        # Si la room a maintenant 2 joueurs, changer son statut en 'playing'
        if room.players_count == 2:
            room.status = 'playing'
            room.save()

        return JsonResponse({"message": f"You just joined {room_id}", "room_id": room_id})

    elif room.status == 'playing':
        return JsonResponse({"error": "This room is currently playing."}, status=400)
    else:
        return JsonResponse({"error": "Room unavalaible."}, status=400)
    
def create_room(request):
    room_id = f"room_{str(uuid.uuid4())[:8]}"

    if Room.objects.filter(room_id=room_id).exists():
        return JsonResponse({"error": "A room with this ID already exists, please retry."}, status=400)
    
    # Créer une nouvelle room avec statut 'waiting'
    room = Room.objects.create(room_id=room_id, status='waiting', players_count=0)
    
    return JsonResponse({"message": "Room successfuly created", "room_id": room.room_id})