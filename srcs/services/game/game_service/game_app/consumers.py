import json
import logging
import asyncio
import time

from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from .game import Game as Jeu

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'room%s' % self.room_name
        self.authenticated = False
        self.user = None
        self.game = None
        self.jeu_task = None
        self.is_host = False
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

        await self.get_game()

        if not await self.user_is_allowed():
            await self.send_error_message("User not allowed in room.")
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name,self.channel_name)
        self.authenticated = True
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'send_message',
                'message': f'{self.user.username} has joined the room.',
            }
        )
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'joined',
                'username': self.user.username,
            }
        )

        if self.user == self.game.player1:
            self.is_host = True

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
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'send_message',
                'message': action_message,  # this is the message to broadcast
            }
        )

        if movement == 'down' or movement == 'up':
            if self.is_host:
                identity = 1
            else:
                identity = 2

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'action_message',
                    'identity': identity,
                    'action': movement,
                }
            )
        return

    async def get_game(self):
        from .models import Game
        self.game = await sync_to_async(get_object_or_404)(Game, room_id=self.room_name)

    async def room_exists(self) -> bool:
        from .models import Game
        try:
            await sync_to_async(get_object_or_404)(Game, room_id=self.room_name)
            return True
        except:
            return False

    async def user_is_allowed(self) -> bool:
        player1 = await sync_to_async(lambda: self.game.player1)()
        player2 = await sync_to_async(lambda: self.game.player2)()
        is_allowed = self.user == player1 or self.user == player2
        return is_allowed
    
    async def send_message(self, event):
        message = event['message']
        print(self.user.username, ':', message)
        await self.send(text_data=json.dumps({'message': message}))

    async def joined(self, event):
        from .models import Game
        self.game = await sync_to_async(get_object_or_404)(Game, room_id=self.room_name)
        if self.is_host and event['username'] != self.user.username:
            self.jeu = Jeu();

            self.jeu_task = asyncio.create_task(self.jeu_loop())

    async def game_state(self, event):
        await self.send(text_data=json.dumps({'message': event['data']}))
        if event['data']['state'] == 'END':
            await self.close()

    async def action_message(self, event):
        if self.is_host:
            if event['identity'] == 1:
                self.jeu.update_player1_direction(event['action'])
            else:
                self.jeu.update_player2_direction(event['action'])

    async def send_error_message(self, error_message):
        await self.send(text_data=json.dumps({'error': error_message}))

    async def disconnect(self, close_code):
        if self.jeu_task:
            self.jeu_task.cancel()
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def send_game_state(self, data):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_state',
                'data': data,
            }
        )

    async def send_start_game(self, data):
        player1 = await sync_to_async(lambda: self.game.player1)()
        player2 = await sync_to_async(lambda: self.game.player2)()
        data['player1']['username'] = player1.username
        data['player2']['username'] = player2.username
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_state',
                'data': data,
            }
        )

    async def jeu_loop(self):
        print('START')
        await self.send_start_game(self.jeu.get_game_start())
        self.game.status = 'playing'
        await sync_to_async(self.game.save)()

        self.jeu.generate_world()
        while time.time() - self.jeu.start_time < 600:
            await self.update()

            self.jeu.delta = time.time() - self.jeu.time
            if self.jeu.game_end:
                break

            self.jeu.time = time.time()
            await asyncio.sleep(0.033) # 30 ticks per seconds

        await self.send_game_state(self.jeu.get_game_end())
        self.game.status = 'finished'
        await sync_to_async(self.game.save)()
        print('END')

    async def update(self):
        self.jeu._ball_hit()
        self.jeu.player1.update(self.jeu.delta)
        self.jeu.player2.update(self.jeu.delta)
        self.jeu.ball.update(self.jeu.delta)
        if self.jeu.pause:
            await self.send_game_state(self.jeu.get_game_score())
            if not self.jeu.game_end:
                await asyncio.sleep(3)
                self.jeu.time = time.time()
            self.jeu.pause = False
        else:
            await self.send_game_state(self.jeu.get_game_state())
