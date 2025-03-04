import pygame

from settings import HEIGHT
from settings import PLAYER_WIDTH, PLAYER_HEIGHT, PADDLE_SPEED

DIR_UP = 2
DIR_DOWN = 1
DIR_NONE = 0

class Player:
    def __init__(self, x, y):
        self.default_x = x
        self.default_y = y
        self.x = x
        self.y = y
        self.rect = pygame.Rect(self.x, self.y, PLAYER_WIDTH, PLAYER_HEIGHT)
        self.color = pygame.Color('white')
        self.score = 0

    def is_collision_wall_up(self):
        return self.y < 0

    def is_collision_wall_down(self):
        return self.y + PLAYER_HEIGHT >= HEIGHT

    def _movement(self, direction, delta):
        if direction == DIR_UP:
            self.y -= PADDLE_SPEED * delta
        elif direction == DIR_DOWN:
            self.y += PADDLE_SPEED * delta

        self.rect.y = self.y

    def reset_pos(self):
        self.y = self.default_y
        self.rect.y = self.y

    def draw(self, screen):
        pygame.draw.rect(screen, self.color, self.rect)

    def update(self, direction, delta):
        self._movement(direction, delta)
