import uuid
from rest_framework import serializers
from .models import Tournament
from .models import UserProfile
from .models import Pool    
from .models import Match

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['username', 'is_authenticated']

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = ['id', 'player_1', 'player_2', 'winner', 'loser', 'status', 'score_player_1', 'score_player_2']

class PoolSerializer(serializers.ModelSerializer):
    users = serializers.SlugRelatedField(slug_field='username', queryset=UserProfile.objects.all(), many=True)
    matches = MatchSerializer(source='match_set', many=True, read_only=True)

    class Meta:
        model = Pool
        fields = ['id', 'name', 'tournament', 'users', 'matches']

class TournamentSerializer(serializers.ModelSerializer):
    players_count = serializers.ReadOnlyField()
    # users = UserProfileSerializer(many=True, read_only=False)
    # pools = PoolSerializer(many=True, read_only=True)
    owner = serializers.PrimaryKeyRelatedField(
        queryset=UserProfile.objects.all(),
        allow_null=True,
        required=False
    )

    class Meta:
        model = Tournament
        fields = ['tournament_id', 'name', 'status', 'owner', 'users', 'max_users', 'players_count']

    def validate_users(self, value):
        """Valider que les usernames existent dans la base de données."""
        users = []
        for username in value:
            try:
                user = UserProfile.objects.get(username=username)  # Recherche par username
                users.append(user)
            except UserProfile.DoesNotExist:
                raise serializers.ValidationError(f"User with username '{username}' does not exist.")
        return users
