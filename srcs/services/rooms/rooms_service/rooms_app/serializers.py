from rest_framework import serializers

from .models import UserProfile
from .models import Room


################################################################
#                                                              #
#                             Room                             #
#                                                              #
################################################################

class RoomSerializer(serializers.ModelSerializer):
    player1_username = serializers.CharField(source='player1.username', read_only=True)  # Affiche le nom de player1
    player2_username = serializers.CharField(source='player2.username', read_only=True)  # Affiche le nom de player2

    class Meta:
        model = Room
        fields = ['room_id', 'player1_username', 'player2_username', 'players_count', 'status']

    @property
    def is_full(self, obj):
        return obj.players_count >= 2

################################################################
#                                                              #
#                             User                             #
#                                                              #
################################################################

class UserProfileSerializer(serializers.ModelSerializer):
    is_authenticated = serializers.SerializerMethodField()
    room_id = serializers.CharField(source='room.room_id', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['username', 'is_authenticated', 'room_id']

    def get_is_authenticated(self, obj):
        return obj.is_authenticated
