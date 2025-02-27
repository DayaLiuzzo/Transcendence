import json
import logging

from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.db.models import QuerySet

class GameConsumer(AsyncWebsocketConsumer):
    
    @sync_to_async
    def room_exists(self, room_name: str) -> bool:
        from game_app.models import Game
        #add verif que le client est autorise dans la room non ?
        return Game.objects.filter(room_id=room_name).exists()

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'room%s' % self.room_name

        self.authenticated = False
        self.user = None
        await self.accept()
        
    async def receive(self, text_data):
        from .authentication import CustomJWTAuth
        text_data_json = json.loads(text_data)
        print("Donnees recues:", text_data_json)

        message_data = text_data_json.get('message', {})
        authorization_header = message_data.get('Authorization', '')
        if not self.authenticated:
            print("authorization_header :", authorization_header)
            if authorization_header:
                try:
                    token_type, token = authorization_header.split(" ")
                    if token_type != 'Bearer':
                        raise AuthenticationFailed("Invalid token type. Expected 'Bearer'.")
                except ValueError:
                    await self.send_error_message("Invalid token format.")
                    return

                try:
                    user = await CustomJWTAuth().authenticate_from_token(token)
                except AuthenticationFailed as e:
                    await self.send_error_message("User not allowed.")
                    await self.close()
                    return

                self.user = user
                self.authenticated = True

                if not await self.room_exists(self.room_name):
                    await self.send_error_message("Invalid room.")
                    await self.close()
                    return

                await self.channel_layer.group_add(
                    self.room_group_name,
                    self.channel_name
                )

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'send_message',
                        'message': f'{self.user.username} has joined the room.',
                    }
                )
            else:
                await self.send_error_message("Authorization header missing.")
                await self.close()
        else:
            message = text_data_json.get('message', '')
            if message:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'send_message',
                        'message': message,
                    }
                )

    async def send_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({'message': message}))

    async def send_error_message(self, error_message):
        await self.send(text_data=json.dumps({'error': error_message}))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
pass