import json
import logging

from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404

class GameConsumer(AsyncWebsocketConsumer):
    
    @sync_to_async
    def room_exists(self) -> bool:
        from game_app.models import Game
        #dans try and catch non ? changer la logique...
        game = get_object_or_404(Game, room_id=self.room_name)
        self.game = game
        return Game.objects.filter(room_id=self.room_name).exists()

    @sync_to_async
    def room_is_full(self) -> bool:
        return self.game.status=='playing'

    @sync_to_async
    def user_is_allowed(self) -> bool:
        return self.game.player1.

    player1 = models.ForeignKey('UserProfile', related_name='game_player1', null=True, blank=True, on_delete=models.SET_NULL)
    player2 = models.ForeignKey('UserProfile', related_name='game_player2', null=True, blank=True, on_delete=models.SET_NULL)
    
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'room%s' % self.room_name
        self.authenticated = False
        self.user = None
        self.game = None

        await self.accept()
        
    async def receive(self, text_data):
        from .authentication import CustomJWTAuth
        
        if not self.authenticated:
            if not text_data:
                await self.close()
                return
            
            try:
                text_data_json = json.loads(text_data)
                print("Donnees recues:", text_data_json)
            except json.JSONDecodeError:
                await self.send_error_message("Invalid JSON format.")
                await self.close()
                return
            message_data = text_data_json.get('message', {})
            authorization_header = message_data.get('Authorization', '')
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

                if not await self.room_exists():
                    await self.send_error_message("Invalid room.")
                    await self.close()
                    return

                if not await self.user_is_allowed():

                await self.channel_layer.group_add(
                    self.room_group_name,
                    self.channel_name
                )

                isfull = await self.room_is_full(self.room_name)
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'send_message',
                        'message': f'{self.user.username} has joined the room.',
                        'isfull': isfull,
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
        isfull = event['isfull']
        await self.send(text_data=json.dumps({'message': message, 'isfull': isfull}))
        # await self.send(text_data=json.dumps(event))

    async def send_error_message(self, error_message):
        await self.send(text_data=json.dumps({'error': error_message}))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
pass