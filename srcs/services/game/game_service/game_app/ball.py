import math
import random

from .settings import WIDTH, HEIGHT, START_SPEED, ACCEL
from .settings import PLAYER_WIDTH, PLAYER_HEIGHT
from .settings import START_SPEED, ACCEL

MAX_Y_VECTOR = 0.6

def normalize(vector):
    vector_length = math.sqrt(vector[0] ** 2 + vector[1] ** 2)
    new_vector = [vector[0] / vector_length, vector[1] / vector_length]
    return new_vector

class Ball:
    def __init__(self, radius):
        self.x = 0
        self.y = 0
        self.radius = radius
        self.reset_pos()
        self.direction = None
        self.speed = START_SPEED
        self.start_random_direction()
        self.last_player = None
        self.collision_wall = None

    def start_random_direction(self):
        self.direction = [random.choice([float(-1), float(1)]), random.uniform(float(-1), float(1))]
        self.direction = normalize(self.direction)

    def is_collision_with_player(self, player):
        if self.last_player == player:
            return False
        return (
                (self.x >= player.x and self.x <= player.x + PLAYER_WIDTH) \
                    or (self.x + self.radius >= player.x  and self.x + self.radius <= player.x + PLAYER_WIDTH) \
                ) and \
                ((self.y >= player.y and self.y <= player.y + PLAYER_HEIGHT) \
                    or (self.y + self.radius >= player.y and self.y + self.radius <= player.y + PLAYER_HEIGHT))


    def is_collision_with_score_zone(self):
        if self.x + self.radius < 0:
            return 'left'
        elif self.x >= WIDTH:
            return 'right'
        else:
            return None

    def is_collision_with_walls(self):
        return self.y < 0 or self.y + self.radius >= HEIGHT

    def new_direction(self, player):
        if player == None: # It is a wall
            if (self.direction[1] < 0 and self.y < 0) \
            or (self.direction[1] > 0 and self.y + self.radius >= HEIGHT):
                self.direction[1] *= -1

        else:
            dist = self.y - (player.y + PLAYER_HEIGHT / 2)
            self.direction[0] *= -1
            new_dir_y = (dist / (PLAYER_HEIGHT / 2)) * MAX_Y_VECTOR
            self.direction[1] = new_dir_y
        self.direction = normalize(self.direction)

    def accelerate(self):
        self.speed += ACCEL

    def _movement(self, delta):
        self.x += self.direction[0] * self.speed * delta
        self.y += self.direction[1] * self.speed * delta

    def reset_pos(self, with_random_pos=True):
        self.speed = START_SPEED
        self.x = WIDTH // 2 - self.radius // 2
        if with_random_pos:
            self.y = random.randint(HEIGHT // 3, 2 * HEIGHT // 3)
        else:
            self.y = HEIGHT // 2
        self.start_random_direction()
        self.last_player = None

    def update(self, delta):
        self._movement(delta)

