"""
ASGI config for pendu_service project.

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

from pendu_app.routing import websocket_urlpatterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pendu_service.settings')

django_asgi_app = get_asgi_application()

print("Les URL WebSocket de pendu_app sont :", websocket_urlpatterns)

application = ProtocolTypeRouter(
        {
            "http": django_asgi_app,
            # "websocket": AllowedHostsOriginValidator(
            #     AuthMiddlewareStack(URLRouter(websocket_urlpatterns))
            "websocket": AuthMiddlewareStack(URLRouter(websocket_urlpatterns)
            ),
        }
)