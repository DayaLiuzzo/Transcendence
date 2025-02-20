from unittest.mock import patch
from unittest.mock import MagicMock
import unittest
from rest_framework.test import APIClient
from rest_framework import status
from .models import Game
from .models import Ball
from .models import Paddle
from .models import UserProfile

from django.urls import reverse
from django.core.management import call_command
from django.contrib.auth.models import User

class GameViewsTest(unittest.TestCase):

    def setUp(self):
        """Création du jeu pour les tests."""
        self.client = APIClient()
        
        # Création d'un utilisateur principal pour l'authentification
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        
        # Connexion de l'utilisateur principal
        self.client.login(username='testuser', password='testpassword')
        
        # Création de la partie (game) et des objets associés (ball, paddles)
        self.room_id = 'room123'
        self.game = Game.objects.create(room_id=self.room_id)
        self.ball = Ball.objects.create(game=self.game)
        self.left_paddle = Paddle.objects.create(game=self.game, side='left', x_position=-2.0)
        self.right_paddle = Paddle.objects.create(game=self.game, side='right', x_position=2.0)
        self.game.paddles.set([self.left_paddle, self.right_paddle])
        self.game.save()

        
    def tearDown(self):
        """Nettoyage après chaque test et réinitialisation de la base de données."""
        # Si tu veux forcer un nettoyage complet de la base de données (en plus du rollback automatique), tu peux appeler flush()
        call_command('flush', '--noinput')  # Réinitialiser la base de données

    @patch('game_app.authentication.CustomJWTAuth.authenticate')  # Correction ici (en minuscule)
    def test_game_service_running(self, mock_authenticate):
        """Test si le service de jeu fonctionne avec un mock d'Authentication."""
        # Simuler une Authentication réussie
        mock_authenticate.return_value = (None, None)

        # Tester l'endpoint sans dépendre de l'Authentication réelle
        url = reverse('game_home')  # Remplacer par l'URL appropriée si nécessaire
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['message'], 'Game service is running')

    def test_create_game_room_exists(self):
        """Test la création d'un jeu dans une room déjà existante."""
        url = reverse('create_game', args=[self.room_id])
        response = self.client.post(url)  # Premier appel
        response = self.client.post(url)  # Deuxième appel (attendu un conflit)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    # @patch('game_app.authentication.CustomJWTAuth.authenticate')
    # def test_join_game_success_player1(self, mock_authenticate):
    #     """Test qu'un utilisateur peut rejoindre un jeu en tant que joueur 1."""

    # @patch('game_app.authentication.CustomJWTAuth.authenticate')
    # def test_join_game_success_player2(self, mock_authenticate):
    #     """Test qu'un utilisateur peut rejoindre un jeu en tant que joueur 2."""

    # def test_join_game_room_full(self):
    #     """Test qu'un utilisateur ne peut pas rejoindre une room pleine."""

    # def test_game_state_success(self):
    #     """Test la récupération de l'état d'un jeu."""

    # def test_delete_game(self):
    #     """Test la suppression d'un jeu."""

    # def test_delete_game_not_found(self):
    #     """Test la suppression d'un jeu qui n'existe pas."""

if __name__ == "__main__":
    unittest.main()
