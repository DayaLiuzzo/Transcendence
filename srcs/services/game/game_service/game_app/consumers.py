import json
import logging

from channels.generic.websocket import AsyncWebsocketConsumer

# Configure logging
logger = logging.getLogger('game_app')

class GameConsumer(AsyncWebsocketConsumer):
    
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'room%s' % self.room_name

        logger.info(f"*********************************************")
        logger.info(f"Client attempting to connect to room  via WS: {self.room_name}")

        # Ajouter le consommateur au groupe
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Accepter la connexion WebSocket
        await self.accept()
        logger.debug(f"Client connected to room: {self.room_name}")

        # Envoyer un message initial au groupe
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'tester_message',
                'tester': 'hello world wesh',  # Message de test
            }
        )

    async def tester_message(self, event):
        tester = event['tester']

        # Envoyer le message au WebSocket
        await self.send(text_data=json.dumps({
            'tester': tester,
        }))
        logger.debug(f"Message sent to room {self.room_name}: {tester}")

    async def disconnect(self, close_code):
        # Supprimer le consommateur du groupe
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        logger.debug(f"Client disconnected from room: {self.room_name}")

pass