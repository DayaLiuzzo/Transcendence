"""
ASGI config for game_service project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter
from channels.routing import URLRouter
from channels.security.websocket import AllowedHostsOriginValidator

from game_app.routing import websocket_urlpatterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'game_service.settings')

application = ProtocolTypeRouter(
        {
            "http": get_asgi_application(),
            # "websocket": AllowedHostsOriginValidator(
            #     AuthMiddlewareStack(URLRouter(websocket_urlpatterns))
            "websocket": AuthMiddlewareStack(URLRouter(websocket_urlpatterns)
            ),
        }
)