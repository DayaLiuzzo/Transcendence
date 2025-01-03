from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
import game_app.routing
from django.urls import path, include

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    'websocket' : AuthMiddlewareStack(
        URLRouter(
            # game_app.routing.websocket_urlpatterns
            path('game/', include('game_app.routing.websocket_urlpatterns')),
        )
    )
})
