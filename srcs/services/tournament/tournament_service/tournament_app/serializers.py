from rest_framework import serializers
from .models import Tournament
from .models import User

class UserSerializer(serializers.ModelSerializer):
    # Si vous voulez savoir si l'utilisateur est authentifié, vous pouvez directement utiliser is_authenticated
    is_authenticated = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['username', 'is_authenticated']

    def get_is_authenticated(self, obj):
        return obj.is_authenticated  # Vérifier l'état d'authentification de l'utilisateur

class TournamentSerializer(serializers.ModelSerializer):
    players_count = serializers.ReadOnlyField()
    users = UserSerializer(many=True, read_only=True)  # Utilisation de UserSerializer pour les utilisateurs associés

    class Meta:
        model = Tournament
        fields = ['name', 'status', 'players_count', 'users', 'max_users']

    def validate_users(self, value):
        """Valider que les usernames existent dans la base de données."""
        users = []
        for username in value:
            try:
                user = User.objects.get(username=username)  # Recherche par username
                users.append(user)
            except User.DoesNotExist:
                raise serializers.ValidationError(f"User with username '{username}' does not exist.")
        return users
    