import uuid
from rest_framework import serializers
from .models import Tournament
from .models import UserProfile
from .models import Pool    
from .models import Match

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['username']

class MatchSerializer(serializers.ModelSerializer):
    player_1 = serializers.StringRelatedField()
    player_2 = serializers.StringRelatedField()
    winner = serializers.StringRelatedField()
    loser = serializers.StringRelatedField()
    class Meta:
        model = Match
        fields = ['player_1', 'player_2', 'winner', 'loser', 'status', 'score_player_1', 'score_player_2']

class PoolSerializer(serializers.ModelSerializer):
    users = serializers.SlugRelatedField(slug_field='username', queryset=UserProfile.objects.all(), many=True)
    matches = MatchSerializer(source='match_set', many=True, read_only=True)

    class Meta:
        model = Pool
        fields = ['name', 'tournament', 'users', 'matches']

class TournamentSerializer(serializers.ModelSerializer):
    users_count = serializers.ReadOnlyField()
    # users = UserProfileSerializer(many=True, read_only=False)
    # pools = PoolSerializer(many=True, read_only=True)
    users = serializers.StringRelatedField(many=True, required=False)
    owner = serializers.StringRelatedField(required=False)

    class Meta:
        model = Tournament
        fields = ['tournament_id', 'name', 'status', 'owner', 'users', 'max_users', 'users_count']
        extra_kwargs = {
                'tournament_id': {'read_only': True},
                'status': {'read_only': True},
                'owner': {'read_only': True},
                'users': {'read_only': True}
        }
