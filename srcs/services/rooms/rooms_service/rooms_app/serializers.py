from rest_framework import serializers

from .models import User
from .models import Room

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['room_id', 'players_count', 'status']

    def get_is_full(self, obj):
        return obj.players_count >= 2
    
class UserSerializer(serializers.ModelSerializer):
    is_authenticated = serializers.SerializerMethodField() #pour dommer acces explicite dans le serializer
    
    class Meta:
        model = User
        fields = ['username', 'isconnected', 'is_authenticated']

    def get_is_authenticated(self, obj):
        return obj.is_authenticated
