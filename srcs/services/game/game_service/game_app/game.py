import time
import sys
from .player import Player, DIR_UP, DIR_DOWN, DIR_NONE
from .ball import Ball
from .settings import WIDTH, HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT

class Game:
    def __init__(self):
        self.game_quit = False
        self.score_limit = 3
        self.winner = None
        self.direction = [None, None]
        self.started = False
        self.pause = False
        self.game_end = False
        self.winner = None
        self.general_time = time.time()
        self._generate_world()

    def _generate_world(self):
        self.player1 = Player(WIDTH // 16, HEIGHT // 2 - (PLAYER_HEIGHT // 2))
        self.player2 = Player(15 * WIDTH // 16 - PLAYER_WIDTH, HEIGHT // 2 - (PLAYER_HEIGHT // 2))
        self.ball = Ball(PLAYER_WIDTH)
        self.delta = 0
        self.time = time.time()

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
            else:
                self.ball.reset_pos()
                self.pause = True
            self.player1.reset_pos()
            self.player2.reset_pos()
            print("RESET")
            #pygame.draw.rect(self.screen, self.ball.color, self.ball.rect)
            #pygame.draw.rect(self.screen, self.player1.color, self.player1.rect)
            #pygame.draw.rect(self.screen, self.player2.color, self.player2.rect)
            self.time = time.time()

    #def _show_score(self):
        #A_score = self.font.render(str(self.player1.score), True, self.color)
        #B_score = self.font.render(str(self.player2.score), True, self.color)
        #A_score_pos = A_score.get_rect(centerx= WIDTH // 4, centery=HEIGHT // 16)
        #B_score_pos = B_score.get_rect(centerx=3 * WIDTH // 4, centery=HEIGHT // 16)
        #self.screen.blit(A_score, A_score_pos)
        #self.screen.blit(B_score, B_score_pos)

    #def _show_winner(self):
        #if self.winner == self.player1:
        #    winner_name = 'Player A'
        #else:
        #    winner_name = 'Player B'

        #sentence = f'{winner_name} won!'
        #image = self.font.render(sentence, True, self.color)
        #image_pos = image.get_rect(centerx=WIDTH // 2, centery=HEIGHT // 3)
        #self.screen.blit(image, image_pos)

    def get_game_state(self):
        data = {
            'player1': {
                'x': self.player1.x,
                'y': self.player1.y,
            },
            'player2': {
                'x': self.player2.x,
                'y': self.player2.y,
            },
            'ball': {
                'x': self.ball.x,
                'y': self.ball.y,
            }
        }
        return data

    def update_player1_direction(self, direction):
        if direction == 'up':
            self.player1.direction = DIR_UP
        elif direction == 'down':
            self.player1.direction = DIR_DOWN
        else:
            self.player1.direction = DIR_NONE

    def update_player2_direction(self, direction):
        if direction == 'up':
            self.player2.direction = DIR_UP
        elif direction == 'down':
            self.player2.direction = DIR_DOWN
        else:
            self.player2.direction = DIR_NONE
