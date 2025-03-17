import time
import sys
from .player import Player, DIR_UP, DIR_DOWN, DIR_NONE
from .ball import Ball
from .settings import WIDTH, HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT

class Game:
    def __init__(self):
        self.score_limit = 1
        self.winner = None
        self.direction = [None, None]
        self.started = False
        self.pause = False
        self.game_end = False
        self.winner = None
        self.player1 = Player(WIDTH // 16, HEIGHT // 2 - (PLAYER_HEIGHT // 2))
        self.player2 = Player(15 * WIDTH // 16 - PLAYER_WIDTH, HEIGHT // 2 - (PLAYER_HEIGHT // 2))
        self.ball = Ball(PLAYER_WIDTH)

    def generate_world(self):
        self.delta = 0
        self.time = time.time()
        self.start_time = time.time()

    def _ball_hit(self):
        score = self.ball.is_collision_with_score_zone()
        if score is None:
            if self.ball.is_collision_with_walls():
                self.ball.new_direction(None)

            elif self.ball.is_collision_with_player(self.player1):#self.ball.rect.colliderect(self.player1):
                self.ball.new_direction(self.player1)
                self.ball.accelerate()
                self.ball.last_player = self.player1
            elif self.ball.is_collision_with_player(self.player2):#self.ball.rect.colliderect(self.player2):
                self.ball.new_direction(self.player2)
                self.ball.accelerate()
                self.ball.last_player = self.player2
        else:
            if score == 'left':
                self.player2.score += 1
            else:
                self.player1.score += 1
            if self.player1.score >= self.score_limit or self.player2.score >= self.score_limit:
                self.game_end = True
                if self.player1.score >= self.score_limit:
                    self.winner = self.player1
                else:
                    self.winner = self.player2
                self.ball.reset_pos(False)
            self.ball.reset_pos()
            self.pause = True
            self.player1.reset_pos()
            self.player2.reset_pos()

    def get_game_start(self):
        data = {
                'state': 'START',
                'width': WIDTH,
                'height': HEIGHT,
                'player_width': PLAYER_WIDTH,
                'player_height': PLAYER_HEIGHT,
                'ball_radius': PLAYER_WIDTH,
                'player1': {
                    'x': self.player1.x,
                    'y': self.player1.y
                },
                'player2': {
                    'x': self.player2.x,
                    'y': self.player2.y
                },
                'ball': {
                    'x': self.ball.x,
                    'y': self.ball.y
                },
                'max_score': self.score_limit
        }
        return data

    def get_game_score(self):
        data = {
            'state': 'SCORE',
            'player1': self.player1.score,
            'player2': self.player2.score
        }
        return data

    def get_game_end(self):
        if self.winner == self.player1:
            winner = 'player1'
        elif self.winner == self.player2:
            winner = 'player2'
        else:
            winner = None

        data = {
            'state': 'END',
            'winner': winner
        }
        return data

    def set_game_end(self, winner):
        if winner == 'player1':
            self.winner = self.player1
        elif winner == 'player2':
            self.winner = self.player2

    def get_game_state(self):
        data = {
            'state': 'INFO',
            'player1_y': self.player1.y,
            'player2_y': self.player2.y,
            'ball': {
                'x': self.ball.x,
                'y': self.ball.y
            }
        }
        return data

    def update_player1_direction(self, direction):
        if self.pause:
            return

        if direction == 'up':
            self.player1.direction = DIR_UP
        elif direction == 'down':
            self.player1.direction = DIR_DOWN
        else:
            self.player1.direction = DIR_NONE

    def update_player2_direction(self, direction):
        if self.pause:
            return

        if direction == 'up':
            self.player2.direction = DIR_UP
        elif direction == 'down':
            self.player2.direction = DIR_DOWN
        else:
            self.player2.direction = DIR_NONE
