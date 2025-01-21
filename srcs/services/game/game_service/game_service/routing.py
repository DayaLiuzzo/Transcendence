from django.urls import include
from django.urls import path

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter
from channels.routing import URLRouter

import game_app.routing

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    'websocket' : AuthMiddlewareStack(
        URLRouter(
            # game_app.routing.websocket_urlpatterns
            path('game/', include('game_app.routing.websocket_urlpatterns')),
        )
    )
})
