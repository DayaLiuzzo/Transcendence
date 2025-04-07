from .settings import HEIGHT
from .settings import PLAYER_WIDTH, PLAYER_HEIGHT, PADDLE_SPEED

DIR_UP = 2
DIR_DOWN = 1
DIR_NONE = 0

class Player:
    def __init__(self, x, y):
        self.default_x = x
        self.default_y = y
        self.x = x
        self.y = y
        self.score = 0
        self.direction = DIR_NONE

    def is_collision_wall_up(self):
        return self.y < 0

    def is_collision_wall_down(self):
        return self.y + PLAYER_HEIGHT >= HEIGHT

    def _movement(self, delta):
        if self.direction == DIR_UP:
            if not self.is_collision_wall_up():
                self.y -= PADDLE_SPEED * delta
                if self.y < 0:
                    self.y = 0
        elif self.direction == DIR_DOWN:
            if not self.is_collision_wall_down():
                self.y += PADDLE_SPEED * delta
                if self.y + PLAYER_HEIGHT >= HEIGHT:
                    self.y = HEIGHT - PLAYER_HEIGHT

    def reset_pos(self):
        self.y = self.default_y
        self.direction = DIR_NONE

    def update(self, delta):
        self._movement(delta)
