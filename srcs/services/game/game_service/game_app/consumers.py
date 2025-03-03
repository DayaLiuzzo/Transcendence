import json
import logging

from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404

class GameConsumer(AsyncWebsocketConsumer):
    
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'room%s' % self.room_name
        self.authenticated = False
        self.user = None
        self.game = None
        await self.accept()
        
    async def receive(self, text_data):
        if not self.authenticated:
            await self.authenticate_user(text_data)
        else:
            await self.handle_received_message(text_data)

    async def authenticate_user(self, text_data):
        if not text_data:
            await self.close()
            return
        
        try:
            text_data_json = json.loads(text_data)
        except json.JSONDecodeError:
            await self.send_error_message("Invalid JSON format.")
            await self.close()
            return
        
        message_data = text_data_json.get('message', {})
        authorization_header = message_data.get('Authorization', '')
        if not authorization_header:
            await self.send_error_message("Authorization header missing.")
            await self.close()
            return

        user = await self.authenticate_with_token(authorization_header)
        if user is None:
            return      

        self.user = user

        if not await self.room_exists():
            await self.send_error_message("Invalid room.")
            await self.close()
            return

        if not await self.user_is_allowed():
            await self.send_error_message("User not allowed in room.")
            await self.close()
            return
        
        await self.channel_layer.group_add(self.room_group_name,self.channel_name)
        self.authenticated = True
        isfull = await self.room_is_full()
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'send_message',
                'message': f'{self.user.username} has joined the room.',
                'isfull': isfull,
            }
        )   
                
    async def authenticate_with_token(self, authorization_header):
        try:
            token_type, token = authorization_header.split(" ")
            if token_type != 'Bearer':
                await self.send_error_message("Invalid token type. Expected 'Bearer'.")
        except ValueError:
            await self.send_error_message("Invalid token format.")
            return None

        try:
            from .authentication import CustomJWTAuth
            user = await CustomJWTAuth().authenticate_from_token(token)
        except AuthenticationFailed as e:
            await self.send_error_message("User not allowed.")
            await self.close()
            return None
        return user

    async def handle_received_message(self, text_data):
        # print(f"Je suis {self.user.username} et je suis dans la fonction handle_received_message")
        
        text_data_json = json.loads(text_data)
        movement = text_data_json.get('message', {})

        if movement == "up":
            action_message = f"{self.user.username} has moved up."
        elif movement == "down":
            action_message = f"{self.user.username} has moved down."
        print(f"{action_message}")
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'send_message',
                'message': action_message,  # this is the message to broadcast
                'isfull': True,
            }
        )
        return

    @sync_to_async
    def room_exists(self) -> bool:
        from game_app.models import Game
        try:
            game = get_object_or_404(Game, room_id=self.room_name)
            self.game = game
            return True
        except:
            return False
        
    @sync_to_async
    def room_is_full(self) -> bool:
        return self.game.status=='playing'

    @sync_to_async
    def user_is_allowed(self) -> bool:
        is_allowed = self.user == self.game.player1 or self.user == self.game.player2
        return is_allowed
    
    async def send_message(self, event):
        message = event['message']
        isfull = event['isfull']
        await self.send(text_data=json.dumps({'message': message, 'isfull': isfull}))

    async def send_error_message(self, error_message):
        await self.send(text_data=json.dumps({'error': error_message}))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

pass