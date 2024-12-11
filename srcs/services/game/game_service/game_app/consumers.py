import json
from channels.generic.websocket import AsyncWebsocketConsumer
import logging

logger = logging.getLogger("django")

class PongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Ajouter le joueur à un groupe (ex. : une partie en cours)
        self.group_name = "pong_game"
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        logger.info(f"WebSocket connection established: {self.scope['client']}")
        await self.accept()

    async def disconnect(self, close_code):
        # Supprimer le joueur du groupe
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        logger.info(f"WebSocket disconnected: {close_code}")
        )

    async def receive(self, text_data):
        # Recevoir les données des clients
        data = json.loads(text_data)
        action_type = data.get("type")
        position = data.get("position")

        # Traiter les positions (ex. : paddle mouvement)
        if action_type == "paddle_move":
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "update_positions",
                    "position": position,
                }
            )
        logger.info(f"Message received: {text_data}")


    async def update_positions(self, event):
        # Envoyer la position mise à jour à tous les clients
        position = event["position"]
        await self.send(text_data=json.dumps({
            "type": "position_update",
            "position": position,
        }))
