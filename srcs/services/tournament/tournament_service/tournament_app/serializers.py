import uuid
from rest_framework import serializers
from .models import Tournament
from .models import UserProfile
from .models import Pool    
from .models import Room
from .models import TournamentHistory

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['username']

class RoomSerializer(serializers.ModelSerializer):
    player1 = serializers.StringRelatedField(read_only=True)
    player2 = serializers.StringRelatedField(read_only=True)
    winner = serializers.StringRelatedField()
    loser = serializers.StringRelatedField()
    class Meta:
        model = Room
        fields = ['room_id', 'player1', 'player2', 'winner', 'loser', 'status', 'score_player1', 'score_player2']

class RoomSerializerInternal(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['player1', 'player2', 'winner', 'loser', 'status', 'score_player1', 'score_player2', 'date_played']

class PoolSerializer(serializers.ModelSerializer):
    users = serializers.StringRelatedField(many=True)
    rooms = RoomSerializer(many=True)

    class Meta:
        model = Pool
        fields = ['name', 'tournament', 'users', 'rooms']
        extra_kwargs = {
                'name': {'read_only': True},
                'tournament': {'read_only': True},
                'users': {'read_only': True},
                'rooms': {'read_only': True}
        }

class TournamentSerializer(serializers.ModelSerializer):
    users_count = serializers.ReadOnlyField()
    # users = UserProfileSerializer(many=True, read_only=False)
    # pools = PoolSerializer(many=True, read_only=True)
    users = serializers.StringRelatedField(many=True, required=False)
    owner = serializers.StringRelatedField(required=False)
    winner = serializers.StringRelatedField(required=False)

    class Meta:
        model = Tournament
        fields = ['tournament_id', 'name', 'status', 'owner', 'users', 'max_users', 'users_count', 'winner']
        extra_kwargs = {
                'tournament_id': {'read_only': True},
                'status': {'read_only': True},
                'owner': {'read_only': True},
                'users': {'read_only': True},
                'winner': {'read_only': True}
        }

class TournamentHistorySerializer(serializers.ModelSerializer):
    tournament_name = serializers.SlugRelatedField(
        queryset=Tournament.objects.all(),
        slug_field='name')
    class Meta:
        model = TournamentHistory
        fields = ['tournament_name', 'result']
