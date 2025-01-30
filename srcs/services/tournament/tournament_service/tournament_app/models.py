from django.db import models
import uuid

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

    tournament_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, primary_key=True)  # ID unique généré
    name = models.CharField(max_length=255, unique=True)
    status = models.CharField(max_length=10, choices=TOURNAMENT_STATUS_CHOICES, default='waiting')
    users = models.ManyToManyField(User)  # Many-to-Many relation with User
    max_users = models.IntegerField(default=10)  # Maximum d'utilisateurs dans un tournoi
    played_matches = models.IntegerField(default=0)
    remaining_matches = models.IntegerField(default=0)
    ongoing_matches = models.IntegerField(default=0)
    total_matches = models.IntegerField(default=0)  # Ajouter un champ pour le total des matchs

    @property
    def players_count(self):
        return self.users.count()  # C'est ok ici car 'users' est une relation ManyToMany

    def __str__(self):
        return f"Tournament {self.id} {self.name} ({self.status})"

    def save(self, *args, **kwargs):
        # Calculer les matchs totaux si nécessaire
        if self.users.count() > 0 and self.total_matches == 0:
            self.total_matches = (self.users.count() * (self.users.count() - 1)) // 2  # Matches à poules, chaque joueur contre chaque autre joueur
        super().save(*args, **kwargs)

    def update_match_stats(self):
        self.played_matches = self.matches.filter(status='finished').count()
        self.remaining_matches = self.total_matches - self.played_matches
        self.ongoing_matches = self.matches.filter(status='playing').count()

        if self.played_matches == self.total_matches:
            self.status = 'finished'
        self.save()

    def is_full(self):
        return self.users.count() >= self.max_users


    def create_pools(self):
        """Divise les joueurs en poules et crée les matchs."""
        players = list(self.users.all())
        num_pools = len(players) // 4  # Divise les joueurs en groupes de 4 (poules de 4 joueurs)

        pools = []
        for i in range(num_pools):
            pool_name = f"Poule {chr(65 + i)}"  # Poule A, Poule B, etc.
            pool = Pool.objects.create(tournament=self, name=pool_name)
            
            # Ajoute les joueurs dans la poule
            pool.users.set(players[i*4:(i+1)*4])
            pool.save()
            
            # Génère les matchs pour cette poule
            pool.generate_matches()
            pools.append(pool)

        return pools
    
class Pool(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name="pools")
    name = models.CharField(max_length=255)  # Par exemple: Poule A, Poule B
    users = models.ManyToManyField(User)  # Liste des joueurs dans la poule
    rank = models.IntegerField(default=1)  # Position dans l'ordre des poules (utile pour l'affichage)

    def __str__(self):
        return f"{self.name} - {self.tournament.name}"

    def get_matches(self):
        """Retourne tous les matchs de la poule."""
        return self.matches.all()
    
    def generate_matches(self):
            """Génère tous les matchs entre les joueurs de la poule."""
            players = list(self.users.all())
            matches = []
            for i in range(len(players)):
                for j in range(i+1, len(players)):
                    match = Match.objects.create(
                        tournament=self.tournament,
                        player_1=players[i],
                        player_2=players[j],
                        status='waiting',
                        pool=self  # Lier le match à la poule
                    )
                    matches.append(match)
            return matches
    
    def calculate_ranking(self):
        players = list(self.users.all())
        ranking = []

        for player in players:
            wins = Match.objects.filter(pool=self, winner=player).count()
            losses = Match.objects.filter(pool=self, loser=player).count()
            draws = Match.objects.filter(pool=self, winner__isnull=True, player_1=player).count()
            points = wins * 3 + draws  # 3 points pour chaque victoire, 1 pour chaque match nul
            ranking.append({
                'player': player.username,
                'points': points,
                'wins': wins,
                'losses': losses,
                'draws': draws
            })
        
        # Trier par points, puis par victoires
        ranking.sort(key=lambda x: (-x['points'], -x['wins']))
        return ranking

class Match(models.Model):
    STATUS_CHOICES = [
        ('waiting', 'Waiting'),
        ('playing', 'Playing'),
        ('finished', 'Finished'),
    ]

    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='matches')
    player_1 = models.ForeignKey('User', on_delete=models.CASCADE, related_name='player_1_matches')
    player_2 = models.ForeignKey('User', on_delete=models.CASCADE, related_name='player_2_matches')
    winner = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name='won_matches')
    loser = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name='lost_matches')
    score_player_1 = models.IntegerField(default=0)  # Ajout du score pour player 1
    score_player_2 = models.IntegerField(default=0)  # Ajout du score pour player 2
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='waiting')
    date_played = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.player_1.username} vs {self.player_2.username}"

    def play(self, winner):
        """Termine le match et met à jour les statistiques."""
        if winner == self.player_1:
            self.winner = self.player_1
            self.loser = self.player_2
        elif winner == self.player_2:
            self.winner = self.player_2
            self.loser = self.player_1
        else:
            self.winner = None
            self.loser = None  # Cas d'un match nul

        self.status = 'finished'
        self.date_played = models.DateTimeField.now()
        self.save()

        # Mise à jour des stats du tournoi
        self.tournament.update_match_stats()

class PlayerHistory(models.Model):
    player = models.ForeignKey('User', on_delete=models.CASCADE)
    match = models.ForeignKey(Match, on_delete=models.CASCADE)
    opponent = models.ForeignKey('User', on_delete=models.CASCADE, related_name='opponent_history')
    result = models.CharField(max_length=10, choices=[('win', 'Win'), ('loss', 'Loss')])

    def __str__(self):
        return f"{self.player.username} vs {self.opponent.username} - {self.result}"