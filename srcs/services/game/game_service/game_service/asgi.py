"""
ASGI config for game_service project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from game.routing import websocket_urlpatterns
from django.urls import path
from game.consumers import GameConsumer



os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'game_service.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            path("ws/", PongConsumer.as_asgi()),
        )
    ),
})

