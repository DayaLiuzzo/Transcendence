from django.db import models

class Room(models.Model):
    ROOM_STATUS_CHOICES = [
        ('waiting', 'Waiting'),  # Room en attente de joueurs
        ('playing', 'Playing'),  # Room en cours de jeu
        ('finished', 'Finished'),  # Room terminée
    ]
    
    room_id = models.CharField(max_length=100, unique=True)  # Identifiant unique de la room
    players_count = models.PositiveIntegerField(default=0)  # Nombre de joueurs dans la room
    status = models.CharField(
        max_length=10,
        choices=ROOM_STATUS_CHOICES,
        default='waiting'  # Statut initial de la room
    )

    def __str__(self):
        return f"Room {self.room_id} ({self.status})"
