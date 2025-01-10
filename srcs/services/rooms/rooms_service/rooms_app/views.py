import uuid

from django.shortcuts import get_object_or_404
from django.http import JsonResponse

from .models import Room

def rooms_service_running(request):
    return JsonResponse({"message": "Rooms service is running"})

def get_rooms(request):
    rooms = Room.objects.all().values('room_id', 'players_count', 'status')#add un filter pour qu'on n'affiche que les rooms pas remplies
    return JsonResponse(list(rooms), safe=False)

def join_or_create_room(request):
    # Vérifier s'il existe des rooms avec le statut "waiting"
    waiting_room = Room.objects.filter(status='waiting', players_count__lt=2).first()

    if waiting_room:
        # Si une room 'waiting' est trouvée et a moins de 2 joueurs, ajouter le joueur
        waiting_room.players_count += 1
        # Si la room a atteint 2 joueurs, changer son statut en 'playing'
        if waiting_room.players_count == 2:
            waiting_room.status = 'playing'
        waiting_room.save()

        # Retourner l'ID de la room existante
        return JsonResponse({"message": "Room found", "room_id": waiting_room.room_id})
    
    else:
        # Si aucune room 'waiting' n'existe, créer une nouvelle room
        room_id = f"room_{str(uuid.uuid4())[:8]}"  # Créer un ID unique
        new_room = Room.objects.create(room_id=room_id, status='waiting', players_count=1)

        # Retourner l'ID de la nouvelle room
        return JsonResponse({"message": "New room created", "room_id": new_room.room_id})