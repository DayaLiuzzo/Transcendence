from django.db import models

class Room(models.Model):
    ROOM_STATUS_CHOICES = [
        ('waiting', 'Waiting'),
        ('playing', 'Playing'),
        ('finished', 'Finished'),
    ]
    
    room_id = models.CharField(max_length=100, unique=True)
    players_count = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=10, choices=ROOM_STATUS_CHOICES, default='waiting')
    player1 = models.ForeignKey('User', related_name='player1_rooms', null=True, blank=True, on_delete=models.SET_NULL)
    player2 = models.ForeignKey('User', related_name='player2_rooms', null=True, blank=True, on_delete=models.SET_NULL)    
    
    def __str__(self):
        return f"Room {self.room_id} ({self.status})"

    @property
    def is_full(self):
        return self.players_count >= 2
    
class User(models.Model):
    username = models.CharField(max_length=255, unique=True)
    isconnected = models.BooleanField(default=0)   
    room = models.ForeignKey('Room', on_delete=models.SET_NULL, null=True, blank=True)  # Relation avec Room

    def __str__(self):
        return self.username
    
    @property
    def is_authenticated(self):
        return True