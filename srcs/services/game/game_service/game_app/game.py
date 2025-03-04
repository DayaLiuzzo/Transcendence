import pygame, time
import sys
from player import Player, DIR_UP, DIR_DOWN, DIR_NONE
from ball import Ball
from settings import WIDTH, HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT

class Game:
    def __init__(self, screen, clock):
        self.screen = screen
        self.clock = clock
        self.delta = 0
        self.game_quit = False
        self.score_limit = 3
        self.winner = None
        self.font = pygame.font.SysFont('Bauhaus 93', 60)
        self.inst_font = pygame.font.SysFont('Bauhaus 93', 30)
        self.color = pygame.Color('white')
        self.direction = [None, None]
        self.pause = False
        self.game_end = False
        self.winner = None
        self._generate_world()

    def _generate_world(self):
        self.playerA = Player(WIDTH // 16, HEIGHT // 2 - (PLAYER_HEIGHT // 2))
        self.playerB = Player(15 * WIDTH // 16 - PLAYER_WIDTH, HEIGHT // 2 - (PLAYER_HEIGHT // 2))
        self.ball = Ball(PLAYER_WIDTH)
        self.time = time.time()

    def _ball_hit(self):
        score = self.ball.is_collision_with_score_zone()
        if score is None:
            if self.ball.is_collision_with_walls():
                self.ball.new_direction(None)

            elif self.ball.is_collision_with_player(self.playerA):#self.ball.rect.colliderect(self.playerA):
                self.ball.new_direction(self.playerA)
                self.ball.accelerate()
                self.ball.last_player = self.playerA
            elif self.ball.is_collision_with_player(self.playerB):#self.ball.rect.colliderect(self.playerB):
                self.ball.new_direction(self.playerB)
                self.ball.accelerate()
                self.ball.last_player = self.playerB
        else:
            if score == 'left':
                self.playerB.score += 1
            else:
                self.playerA.score += 1
            if self.playerA.score >= self.score_limit or self.playerB.score >= self.score_limit:
                self.game_end = True
                if self.playerA.score >= self.score_limit:
                    self.winner = self.playerA
                else:
                    self.winner = self.playerB
                self.ball.reset_pos(False)
            else:
                self.ball.reset_pos()
                self.pause = True
            self.playerA.reset_pos()
            self.playerB.reset_pos()
            pygame.draw.rect(self.screen, self.ball.color, self.ball.rect)
            pygame.draw.rect(self.screen, self.playerA.color, self.playerA.rect)
            pygame.draw.rect(self.screen, self.playerB.color, self.playerB.rect)
            self.time = time.time()

    def _show_score(self):
        A_score = self.font.render(str(self.playerA.score), True, self.color)
        B_score = self.font.render(str(self.playerB.score), True, self.color)
        A_score_pos = A_score.get_rect(centerx= WIDTH // 4, centery=HEIGHT // 16)
        B_score_pos = B_score.get_rect(centerx=3 * WIDTH // 4, centery=HEIGHT // 16)
        self.screen.blit(A_score, A_score_pos)
        self.screen.blit(B_score, B_score_pos)

    def _show_winner(self):
        if self.winner == self.playerA:
            winner_name = 'Player A'
        else:
            winner_name = 'Player B'

        sentence = f'{winner_name} won!'
        image = self.font.render(sentence, True, self.color)
        image_pos = image.get_rect(centerx=WIDTH // 2, centery=HEIGHT // 3)
        self.screen.blit(image, image_pos)

    def key_events(self):
        keys = pygame.key.get_pressed()

        if keys[pygame.K_ESCAPE]:
            self.game_quit = True
            return

        self.direction[:] = [None, None]

        if keys[pygame.K_w]:
            if not self.playerA.is_collision_wall_up():
                self.direction[0] = DIR_UP
        if keys[pygame.K_s]:
            if not self.playerA.is_collision_wall_down():
                self.direction[0] = DIR_DOWN

        if keys[pygame.K_UP]:
            if not self.playerB.is_collision_wall_up():
                self.direction[1] = DIR_UP
        if keys[pygame.K_DOWN]:
            if not self.playerB.is_collision_wall_down():
                self.direction[1] = DIR_DOWN

    def _draw(self):
        pygame.display.flip()

    def _update(self):
        if not self.game_end and not self.game_quit:
            if not self.pause:
                self._ball_hit()
                self.playerA.update(self.direction[0], self.delta)
                self.playerB.update(self.direction[1], self.delta)
                self.ball.update(self.delta)
            else:
                if time.time() - self.time >= 1.5:
                    self.pause = False
        elif self.game_end:
            self._show_winner()
        self.playerA.draw(self.screen)
        self.playerB.draw(self.screen)
        self.ball.draw(self.screen)
        self._show_score()

    def loop(self):
        while True:
            self.screen.fill('black')
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    return False
            self.key_events()
            if self.game_quit:
                break

            self._update()
            self._draw()
            self.delta = self.clock.tick(30) / 1000
            if self.game_end:
                if time.time() - self.time >= 3.0:
                    break

        return True
