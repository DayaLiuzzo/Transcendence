import pygame, sys
from settings import WIDTH, HEIGHT
from game import Game
import time

class Pong:
    def __init__(self, screen):
        self.screen = screen
        self.FPS = pygame.time.Clock()

    def draw(self):
        pygame.display.flip()

    def main(self):
        game = Game(self.screen, self.FPS)
        
        while True:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    break
            game.loop()
            break
        #self.draw()

if __name__ == '__main__':
    pygame.init()
    pygame.display.set_caption("Pong Game")
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    play = Pong(screen)
    play.main()
