
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

class GameSerializer(serializers.ModelSerializer):
    player1 = UserProfileSerializer()
    player2 = UserProfileSerializer()
    
    class Meta:
        model = Game
        fields = ['room_id', 'status', 'player1', 'player2']
