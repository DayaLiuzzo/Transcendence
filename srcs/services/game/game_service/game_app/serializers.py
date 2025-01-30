from rest_framework import serializers

from .models import Ball
from .models import Game
from .models import Paddle
from .models import User


################################################################
#                                                              #
#                             User                             #
#                                                              #
################################################################

class UserSerializer(serializers.ModelSerializer):
    is_authenticated = serializers.SerializerMethodField()
    # room_id = serializers.CharField(source='room.room_id', read_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'is_authenticated']

    def get_is_authenticated(self, obj):
        return obj.is_authenticated

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
    paddles = PaddleSerializer(many=True)
    ball = BallSerializer()

    class Meta:
        model = Game
        fields = ['room_id', 'status', 'paddles', 'ball']