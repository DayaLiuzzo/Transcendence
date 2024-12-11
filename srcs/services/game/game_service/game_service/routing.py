from django.urls import path
from .consumers import PongConsumer

websocket_urlpatterns = [
    path("ws/game/", PongConsumer.as_asgi()),
]
