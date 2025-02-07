from .models import Match

def calculate_ranking(tournament):
    # Récupérer tous les joueurs du tournoi et leurs résultats
    players = tournament.users.all()
    ranking = []

    for player in players:
        # Compter les victoires et les défaites du joueur
        wins = player.won_matches.filter(tournament=tournament).count()
        losses = player.lost_matches.filter(tournament=tournament).count()
        
        # Ajout d'un tuple avec le joueur, les victoires et les défaites
        ranking.append({
            'player': player.username,
            'wins': wins,
            'losses': losses,
            'total_matches': wins + losses,
            'win_percentage': wins / (wins + losses) if (wins + losses) > 0 else 0
        })
    
    # Trier par pourcentage de victoires
    ranking = sorted(ranking, key=lambda x: x['win_percentage'], reverse=True)

    return ranking