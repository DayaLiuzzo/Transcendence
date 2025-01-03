"""
ASGI config for game_service project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application
from game_app.routing import websocket_urlpatterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'game_service.settings')

django_asgi_app = get_asgi_application()

print("Les URL WebSocket de game_app sont :", websocket_urlpatterns)

application = ProtocolTypeRouter(
        {
            "http": django_asgi_app,
            # "websocket": AllowedHostsOriginValidator(
            #     AuthMiddlewareStack(URLRouter(websocket_urlpatterns))
            "websocket": AuthMiddlewareStack(URLRouter(websocket_urlpatterns)
            ),
        }
)