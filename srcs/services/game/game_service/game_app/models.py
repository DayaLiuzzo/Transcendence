from django.db import models

################################################################
#                                                              #
#                             Game                             #
#                                                              #
################################################################

class Game(models.Model):
    GAME_STATUS_CHOICES = [
        ('waiting', 'Waiting'),
        ('pause', 'Pause'),
        ('playing', 'Playing'),
        ('finished', 'Finished'),
        ('deleted', 'Deleted'),
    ]
    
    room_id = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=10, choices=GAME_STATUS_CHOICES, default='waiting')
    player1 = models.ForeignKey('UserProfile', related_name='game_player1', null=True, blank=True, on_delete=models.SET_NULL)
    player2 = models.ForeignKey('UserProfile', related_name='game_player2', null=True, blank=True, on_delete=models.SET_NULL)
    from_tournament = models.BooleanField()
    
    def __str__(self):
        return f"Game {self.room_id} ({self.status})"

################################################################
#                                                              #
#                             User                             #
#                                                              #
################################################################


class UserProfile(models.Model):
    username = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.username
    
    @property
    def is_authenticated(self):
        return True
