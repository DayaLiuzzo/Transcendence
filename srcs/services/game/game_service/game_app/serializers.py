
from rest_framework import serializers

from .models import Ball
from .models import Game
from .models import Paddle
from .models import UserProfile


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
#                            Paddle                            #
#                                                              #
################################################################


class PaddleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paddle
        fields = ['x_position', 'y_position', 'width', 'height', 'side']

################################################################
#                                                              #
#                             Ball                             #
#                                                              #
################################################################

class BallSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ball
        fields = ['x_position', 'y_position', 'x_velocity', 'y_velocity', 'radius']

################################################################
#                                                              #
#                             Game                             #
#                                                              #
################################################################

class GameSerializer(serializers.ModelSerializer):
    player1 = UserProfileSerializer()
    player2 = UserProfileSerializer()
    paddles = PaddleSerializer(many=True)
    ball = BallSerializer()
    
    class Meta:
        model = Game
        fields = ['room_id', 'status', 'player1', 'player2', 'paddles', 'ball']