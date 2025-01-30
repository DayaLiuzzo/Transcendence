from django.db import models

################################################################
#                                                              #
#                            Paddle                            #
#                                                              #
################################################################

class Paddle(models.Model):
    game = models.ForeignKey('Game', on_delete=models.CASCADE,  related_name='paddles_instance')
    player = models.ForeignKey('User', on_delete=models.CASCADE)
    side = models.CharField(max_length=10, choices=[('left', 'Left'), ('right', 'Right')])
    x_position = models.FloatField()
    y_position = models.FloatField(default=0.0)
    width = models.FloatField(default=2.0)
    height = models.FloatField(default=10.0)

    #ajouter les limites du terrain
    def move(self, delta_y):
        self.y_position += delta_y
        self.save()

    def __str__(self):
        return f"Paddle for {self.player.username} in game {self.game.room_id}"

################################################################
#                                                              #
#                             Ball                             #
#                                                              #
################################################################

class Ball(models.Model):
    game = models.ForeignKey('Game', on_delete=models.CASCADE, related_name='ball_instance')
    x_position = models.FloatField(default=0.0)
    y_position = models.FloatField(default=0.0)
    x_velocity = models.FloatField(default=1.0)
    y_velocity = models.FloatField(default=1.0)
    radius = models.FloatField(default=5.0)

    def move(self):
        self.x_position += self.x_velocity
        self.y_position += self.y_velocity
        self.save()

    def bounce(self, axis):
        if axis == 'x':
            self.x_velocity = -self.x_velocity
        elif axis == 'y':
            self.y_velocity = -self.y_velocity
        self.save()

    def __str__(self):
        return f"Ball in game at position ({self.x_position}, {self.y_position})"

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
    ]
    
    room_id = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=10, choices=GAME_STATUS_CHOICES, default='waiting')
    player1 = models.ForeignKey('User', related_name='game_player1', null=True, blank=True, on_delete=models.SET_NULL)
    player2 = models.ForeignKey('User', related_name='game_player2', null=True, blank=True, on_delete=models.SET_NULL)
    
    paddles = models.ManyToManyField(Paddle, related_name='games')
    ball = models.OneToOneField(Ball, on_delete=models.CASCADE, related_name='game_instance')

    def __str__(self):
        return f"Game {self.room_id} ({self.status})"

################################################################
#                                                              #
#                             User                             #
#                                                              #
################################################################


class User(models.Model):
    username = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.username
    
    @property
    def is_authenticated(self):
        return True