from django.db import models

class User(models.Model):
    username = models.CharField(max_length=255, unique=True)
    isconnected = models.BooleanField(default=0)   
    # tournament = models.ForeignKey('Room', on_delete=models.SET_NULL, null=True, blank=True)  # Relation avec Room

    def __str__(self):
        return self.username
    
    @property
    def is_authenticated(self):
        return True
    

class Tournament(models.Model):
    TOURNAMENT_STATUS_CHOICES = [
        ('waiting', 'Waiting'),
        ('playing', 'Playing'),
        ('finished', 'Finished'),
    ]
    
    name = models.CharField(max_length=255, unique=True)
    status = models.CharField(max_length=10, choices=TOURNAMENT_STATUS_CHOICES, default='waiting')
    users = models.ManyToManyField(User)  # Many-to-Many relation with User
    max_users = models.IntegerField(default=10)  # Maximum d'utilisateurs dans un tournoi
    # played_matches = models.IntegerField(default=0)
    # remaining_matches = models.IntegerField(default=0)
    # ongoing_matches = models.IntegerField(default=0)
    # start_date = models.DateTimeField()
    # end_date = models.DateTimeField()


    @property
    def players_count(self):
        return self.users.count()  # C'est ok ici car 'users' est une relation ManyToMany

    def __str__(self):
        return f"Tournament {self.name} ({self.status})"

    # def update_match_stats(self):
    #     self.played_matches = self.matches.filter(status='finished').count()
    #     self.remaining_matches = self.total_matches - self.played_matches
    #     self.ongoing_matches = self.matches.filter(status='playing').count()

    #     if self.played_matches == self.total_matches:
    #         self.status = 'finished'
    #     self.save()

    def is_full(self):
        return self.users.count() >= self.max_users
