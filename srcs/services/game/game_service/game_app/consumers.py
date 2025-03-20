import json
import logging
import asyncio
import time
import datetime

from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from .game import Game as Jeu

async def send_results_to_rooms(data):
    from service_connector.service_connector import MicroserviceClient
    from .serializers import GameSerializer

    serializer = GameSerializer(data=data)
    await sync_to_async(serializer.is_valid)(raise_exception=True)
    client = MicroserviceClient()
    url = f"http://rooms:8443/api/rooms/update_room/{data['room_id']}/"
    print('==========================')
    print(serializer.data)
    print('==========================')
    await sync_to_async(client.send_internal_request)(url, 'patch', data=serializer.data)

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'room%s' % self.room_name
        self.authenticated = False
        self.user = None
        self.game = None
        self.jeu_task = None
        self.jeu = None
        self.is_host = False
        self.data_sent = False
        self.player_count = 0
        self.final_game_data = {
        }
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
        status = await sync_to_async(lambda: self.game.status)()

        if status == 'finished':
            await self.send_error_message("Game already finished.")
            await self.close()
            return

        if not await self.user_is_allowed():
            await self.send_error_message("User not allowed in room.")
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name,self.channel_name)
        self.authenticated = True
        self.player_count += 1
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
        
        if movement == 'down' or movement == 'up' or movement == 'idle':
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

    async def joined(self, event):
        username = event['username']
        if self.user.username != username:
            self.player_count += 1

        if self.player_count >= 2:
            await self.channel_layer.group_send(
                self.room_group_name,
                {'type': 'launch_game'}
            )

    async def launch_game(self, event):
        from .models import Game

        if self.is_host:
            self.jeu = Jeu()
            self.game = await sync_to_async(get_object_or_404)(Game, room_id=self.room_name)
            player1 = await sync_to_async(lambda: self.game.player1)()
            player2 = await sync_to_async(lambda: self.game.player2)()
            self.final_game_data = {
                'room_id': self.room_name,
                'player1': player1.pk,
                'player2': player2.pk,
                'date_played': datetime.datetime.today()
            }
            self.jeu_task = asyncio.create_task(self.jeu_loop())

    async def left(self, event):
        if self.is_host:
            if not self.data_sent:
                player_disconnected = event['player_type']

                if self.jeu:
                    if self.jeu.game_end:
                        await self.update_final_game_data()
                    else:
                        player1 = await sync_to_async(lambda: self.game.player1)()
                        player2 = await sync_to_async(lambda: self.game.player2)()

                        if player_disconnected == '1':
                            self.jeu.set_game_end('player2')
                        else:
                            self.jeu.set_game_end('player1')

                        await self.update_final_game_data()
                    await self.send_game_state(self.jeu.get_game_end())
                    await send_results_to_rooms(self.final_game_data)
                    self.data_sent = True
                    await sync_to_async(self.game.delete)()
                else:
                    from_tournament = await sync_to_async(lambda: self.game.from_tournament)()
                    if not from_tournament:
                        self.final_game_data = {
                            'room_id': self.room_name,
                            'status': 'deleted',
                            'winner': None,
                            'loser': None,
                            'score_player1': 0,
                            'score_player2': 0,
                            'date_played': None
                        }
                        await send_results_to_rooms(self.final_game_data)
                        self.data_sent = True
                        await sync_to_async(self.game.delete)()
                    else:
                        return



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
            try:
                await self.jeu_task
            except asyncio.CancelledError:
                pass

        if self.game:
            player1 = await sync_to_async(lambda: self.game.player1)()
            player_type = '1' if self.user == player1 else '2'
            if self.is_host:
                await self.left({'player_type': player_type})
            else:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'left',
                        'player_type': player_type,
                    }
                )

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

    async def update_final_game_data(self):
        self.final_game_data['status'] = 'finished'
        player1 = await sync_to_async(lambda: self.game.player1)()
        player2 = await sync_to_async(lambda: self.game.player2)()
        if not self.jeu.winner:
            self.final_game_data['winner'] = None
            self.final_game_data['loser'] = None
        else:
            if self.jeu.winner == self.jeu.player1:
                self.final_game_data['winner'] = player1.pk
                self.final_game_data['loser'] = player2.pk
            else:
                self.final_game_data['winner'] = player2.pk
                self.final_game_data['loser'] = player1.pk

        self.final_game_data['score_player1'] = self.jeu.player1.score
        self.final_game_data['score_player2'] = self.jeu.player2.score

    async def jeu_loop(self):
        await self.send_start_game(self.jeu.get_game_start())
        self.game.status = 'playing'
        await sync_to_async(self.game.save)()

        self.jeu.generate_world()
        while True:
            if not self.jeu.game_started:
                if time.time() - self.jeu.start_time >= 3:
                    self.jeu.game_started = True

            await self.update()

            self.jeu.delta = time.time() - self.jeu.time
            if self.jeu.game_end:
                break

            self.jeu.time = time.time()
            await asyncio.sleep(0.033) # 30 ticks per seconds

        self.game.status = 'finished'
        await sync_to_async(self.game.save)()
        await self.update_final_game_data()
        await send_results_to_rooms(self.final_game_data)
        await self.send_game_state(self.jeu.get_game_end())

    async def update(self):
        if self.jeu._ball_hit():
            await self.send_game_state({'state': 'COLLISION'})
        self.jeu.player1.update(self.jeu.delta)
        self.jeu.player2.update(self.jeu.delta)
        if self.jeu.game_started:
            self.jeu.ball.update(self.jeu.delta)
        if self.jeu.pause:
            await self.send_game_state(self.jeu.get_game_score())
            if not self.jeu.game_end:
                await asyncio.sleep(3)
                self.jeu.time = time.time()
            self.jeu.pause = False
        else:
            await self.send_game_state(self.jeu.get_game_state())
