from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Game
from .models import Ball
from .models import Paddle

import logging

# Configure logging
logger = logging.getLogger('game_app')
