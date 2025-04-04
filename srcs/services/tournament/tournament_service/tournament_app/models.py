from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class UserProfile(models.Model):
    username = models.CharField(max_length=255, unique=True)
    # isconnected = models.BooleanField(default=0)   
    tournaments = models.ManyToManyField('TournamentHistory', blank=True, related_name='tournament_history')  # Relation avec Room

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
        ('error', 'Error'),
    ]

    tournament_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, primary_key=True)  # ID unique généré
    name = models.CharField(max_length=64)
    status = models.CharField(max_length=16, choices=TOURNAMENT_STATUS_CHOICES, default='waiting')
    users = models.ManyToManyField(UserProfile, blank=True, related_name='list_users_in_tournament')  # Many-to-Many relation with UserProfile
    max_users = models.IntegerField(default=10, validators=[MinValueValidator(3), MaxValueValidator(32)])  # Maximum d'utilisateurs dans un tournoi
    owner = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, blank=True, null=True, related_name='owner')
    # played_matches = models.IntegerField(default=0)
    # remaining_matches = models.IntegerField(default=0)
    # ongoing_matches = models.IntegerField(default=0)
    # total_matches = models.IntegerField(default=0)  # Ajouter un champ pour le total des matchs
    pools = models.ManyToManyField('Pool', blank=True, related_name='pools')
    pool_index = models.IntegerField(default=0)
    winner = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, blank=True, null=True, related_name='tournament_winner')
    win = models.ForeignKey('TournamentHistory', on_delete=models.CASCADE, blank=True, null=True, related_name='tournament_history_win')
    loss = models.ForeignKey('TournamentHistory', on_delete=models.CASCADE, blank=True, null=True, related_name='tournament_history_loss')

    @property
    def users_count(self):
        return self.users.count()  # C'est ok ici car 'users' est une relation ManyToMany

    def __str__(self):
        return f"Tournament {self.tournament_id} {self.name} ({self.status})"

    # def save(self, *args, **kwargs):
    #     # Calculer les matchs totaux si nécessaire
    #     if self.users.count() > 0 and self.total_matches == 0:
    #         self.total_matches = (self.users.count() * (self.users.count() - 1)) // 2  # Matches à poules, chaque joueur contre chaque autre joueur
    #     super().save(*args, **kwargs)

    # def update_match_stats(self):
    #     self.played_matches = self.matches.filter(status='finished').count()
    #     self.remaining_matches = self.total_matches - self.played_matches
    #     self.ongoing_matches = self.matches.filter(status='playing').count()

    #     if self.played_matches == self.total_matches:
    #         self.status = 'finished'
    #     self.save()

    def is_full(self):
        return self.users.count() >= self.max_users

    def get_pools(self):
        return self.pools.all()

    def get_current_pools(self):
        return self.pools.filter(pool_index=self.pool_index - 1)

    def generate_pools(self):
        if not self.pools.exists():
            """Divise les joueurs en poules et crée les matchs."""
            players = list(self.users.all())
            reminder = len(players) % 4
            num_pools = (len(players) + 4 - reminder) // 4  # Divise les joueurs en groupes de 4 (poules de 4 joueurs), on ajoute 4 - reminder car la division entiere arrondie vers le bas mais nous voulons l'arrondir vers le haut
        else:
            players = []
            for pool in self.pools.filter(pool_index=self.pool_index-1):
                players.append(pool.winner)
            reminder = len(players) % 4
            num_pools = (len(players) + 4 - reminder) // 4  # Divise les joueurs en groupes de 4 (poules de 4 joueurs), on ajoute 4 - reminder car la division entiere arrondie vers le bas mais nous voulons l'arrondir vers le haut

        total_pools = self.pools.count()
        for i in range(num_pools):
            pool_name = f"Poule {chr(65 + total_pools + i)}"  # Poule A, Poule B, etc.
            pool = Pool.objects.create(tournament=self, name=pool_name, pool_index=self.pool_index)
            
            # Ajoute les joueurs dans la poule
            pool.users.set(players[i*4:(i+1)*4])
            if pool.users.count() == 1:
                pool.winner = pool.users[0]
            pool.save()
            
            # Génère les matchs pour cette poule
            pool.generate_rooms()
            self.pools.add(pool)

        self.pool_index += 1

    def all_pool_finished(self):
        return all(pool.winner for pool in self.pools.filter(pool_index=self.pool_index-1))

class Pool(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    name = models.CharField(max_length=16)  # Par exemple: Poule A, Poule B
    users = models.ManyToManyField(UserProfile, related_name='list_users_in_pool')  # Liste des joueurs dans la poule
    rooms = models.ManyToManyField('Room', blank=True, related_name='list_rooms')
    winner = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, blank=True, null=True, related_name='pool_winner')
    pool_index = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.name} - {self.tournament.name}"

    def get_rooms(self):
        """Retourne tous les matchs de la poule."""
        return self.rooms.all()
    
    def generate_rooms(self):
            """Génère tous les matchs entre les joueurs de la poule."""
            if not self.rooms.exists():
                players = list(self.users.all())
                players_in_room = []
                if len(players) == 1:
                    self.pool.winner = players[0]
                else:
                    for i in range(len(players)):
                        for j in range(i+1, len(players)):
                            status = 'waiting'
                            if players[i] in players_in_room or players[j] in players_in_room:
                                status = 'standby'
                            else:
                                players_in_room.append(players[i])
                                players_in_room.append(players[j])

                            match = Room.objects.create(
                                pool=self,  # Lier le match à la poule
                                player1=players[i],
                                player2=players[j],
                                status=status
                            )
                            self.rooms.add(match)
            else:
                players_in_room = []
                rooms = self.rooms.filter(status='standby')
                for room in rooms:
                    if not (room.player1 in players_in_room) and not (room.player2 in players_in_room):
                        players_in_room.append(room.player1)
                        players_in_room.append(room.player2)
                        room.status = 'waiting'
                        room.save()


    def calculate_ranking(self):
        players = list(self.users.all())
        ranking = []

        for player in players:
            wins = self.rooms.filter(winner=player).count()
            wins += self.rooms.filter(winner__isnull=True, loser=player).count()
            losses = self.rooms.filter(loser=player).count()
            draws = self.rooms.filter(winner__isnull=True, player1=player).exclude(loser=player).count()
            draws += self.rooms.filter(winner__isnull=True, player2=player).exclude(loser=player).count()
            points = wins * 3 + draws  # 3 points pour chaque victoire, 1 pour chaque match nul
            ranking.append({
                'player': player,
                'points': points,
                'wins': wins,
                'losses': losses,
                'draws': draws
            })
        
        # Trier par points, puis par victoires
        ranking.sort(key=lambda x: (-x['points'], -x['wins']))
        return ranking

    def all_rooms_finished(self):
        return all(room.status == 'finished' for room in self.get_rooms())

    def rooms_wave_finished(self):
        return all(room.status != 'waiting' and room.status != 'playing' for room in self.get_rooms())

class Room(models.Model):
    STATUS_CHOICES = [
        ('waiting', 'Waiting'),
        ('standby', 'Standby'),
        ('playing', 'Playing'),
        ('finished', 'Finished'),
    ]

    pool = models.ForeignKey(Pool, on_delete=models.CASCADE)
    room_id = models.CharField(max_length=100, blank=True)
    player1 = models.ForeignKey('UserProfile', on_delete=models.SET_NULL, null=True, related_name='player1_matches')
    player2 = models.ForeignKey('UserProfile', on_delete=models.SET_NULL, null=True, related_name='player2_matches')
    winner = models.ForeignKey('UserProfile', on_delete=models.SET_NULL, null=True, blank=True, related_name='room_winner')
    loser = models.ForeignKey('UserProfile', on_delete=models.SET_NULL, null=True, blank=True, related_name='room_looser')
    score_player1 = models.IntegerField(default=0)  # Ajout du score pour player 1
    score_player2 = models.IntegerField(default=0)  # Ajout du score pour player 2
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='waiting')
    date_played = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.player1.username} vs {self.player2.username}"

    """
    def play(self, winner):
        #Termine le match et met à jour les statistiques.
        if winner == self.player1:
            self.winner = self.player1
            self.loser = self.player2
        elif winner == self.player2:
            self.winner = self.player2
            self.loser = self.player1
        else:
            self.winner = None
            self.loser = None  # Cas d'un match nul

        self.status = 'finished'
        self.date_played = models.DateTimeField.now()
        self.save()

        # Mise à jour des stats du tournoi
        #self.tournament.update_match_stats()
    """

class TournamentHistory(models.Model):
    tournament = models.ForeignKey('Tournament', on_delete=models.CASCADE, blank=True)
    result = models.CharField(max_length=10, choices=[('win', 'Win'), ('loss', 'Loss')])

    def __str__(self):
        return f"{self.player.username} vs {self.opponent.username} - {self.result}"
