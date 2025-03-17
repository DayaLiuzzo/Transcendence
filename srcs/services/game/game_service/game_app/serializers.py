
from rest_framework import serializers

from .models import UserProfile
from .models import Game

################################################################
#                                                              #
#                             User                             #
#                                                              #
################################################################

class UserProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserProfile
        fields = ['username']

################################################################
#                                                              #
#                             Game                             #
#                                                              #
################################################################

class GameSerializer(serializers.Serializer):
    room_id = serializers.CharField(max_length=100)
    status = serializers.CharField(max_length=10)
    winner = serializers.PrimaryKeyRelatedField(queryset=UserProfile.objects.all(), allow_null=True)
    loser = serializers.PrimaryKeyRelatedField(queryset=UserProfile.objects.all(), allow_null=True)
    score_player1 = serializers.IntegerField()
    score_player2 = serializers.IntegerField()
    date_played = serializers.DateTimeField(allow_null=True)
    class Meta:
        model = Game
        fields = ['player1', 'player2', 'room_id', 'status', 'winner', 'loser', 'score_player1', 'score_player2', 'date_played']
