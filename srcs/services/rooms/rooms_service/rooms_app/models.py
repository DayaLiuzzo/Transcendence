from django.db import models

################################################################
#                                                              #
#                             Room                             #
#                                                              #
################################################################

class Room(models.Model):
    ROOM_STATUS_CHOICES = [
        ('waiting', 'Waiting'),
        ('playing', 'Playing'),
        ('finished', 'Finished'),
        ('deleted', 'Deleted'),
    ]
    
    room_id = models.CharField(max_length=100, unique=True)
    players_count = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=10, choices=ROOM_STATUS_CHOICES, default='waiting')
    player1 = models.ForeignKey('UserProfile', related_name='player1_rooms', null=True, blank=True, on_delete=models.SET_NULL)
    player2 = models.ForeignKey('UserProfile', related_name='player2_rooms', null=True, blank=True, on_delete=models.SET_NULL)    
    winner = models.ForeignKey('UserProfile', on_delete=models.SET_NULL, null=True, blank=True, related_name='won_matches')
    loser = models.ForeignKey('UserProfile', on_delete=models.SET_NULL, null=True, blank=True, related_name='lost_matches')
    score_player1 = models.IntegerField(default=0)  # Ajout du score pour player 1
    score_player2 = models.IntegerField(default=0)  # Ajout du score pour player 2
    date_played = models.DateTimeField(null=True, blank=True)
    is_from_tournament = models.BooleanField(default=False)

    def __str__(self):
        return f"Room {self.room_id} ({self.status})"

    @property
    def is_full(self):
        return self.players_count >= 2

################################################################
#                                                              #
#                          UserProfile                         #
#                                                              #
################################################################

class UserProfile(models.Model):
    username = models.CharField(max_length=255, unique=True)
    rooms = models.ManyToManyField('Room', blank=True)

    def __str__(self):
        return self.username
    
    @property
    def is_authenticated(self):
        return True
