from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Game
from .models import Ball
from .models import Paddle

import logging

# Configure logging
logger = logging.getLogger('game_app')

@receiver(post_save, sender=Game)
def create_game_objects(sender, instance, created, **kwargs):
    if created:
        print(f"Création du jeu {instance.room_id}...")

        ball = Ball.objects.create(game=instance)
        logger.debug(f"Balle créée : {ball}")

        paddle_left = Paddle.objects.create(
            game=instance,
            player=instance.player1,
            side='left',
            x_position=-10.0
        )

        logger.debug(f"Paddle gauche créé : {paddle_left}")

        paddle_right = Paddle.objects.create(
            game=instance,
            player=instance.player2,
            side='right',
            x_position=10.0
        )
        
        logger.debug(f"Paddle droit créé : {paddle_right}")


        instance.paddles.add(paddle_left, paddle_right)
