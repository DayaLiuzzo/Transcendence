class PongGame:
    def __init__(self):
        self.ball_pos = {'x': 50, 'y': 50}  # Position de la balle
        self.ball_velocity = {'x': 1, 'y': 1}  # Vitesse de la balle
        self.paddle_left = {'y': 50}  # Position du paddle gauche
        self.paddle_right = {'y': 50}  # Position du paddle droit
        self.score = {'left': 0, 'right': 0}  # Score du jeu
        self.game_over = False  # Statut de la partie

    def update(self):
        if self.game_over:
            return
        
        # Calcul des nouvelles positions de la balle
        self.ball_pos['x'] += self.ball_velocity['x']
        self.ball_pos['y'] += self.ball_velocity['y']

        # Vérification des collisions avec les murs et les paddles
        if self.ball_pos['y'] <= 0 or self.ball_pos['y'] >= 100:  # Collisions avec les bords verticalement
            self.ball_velocity['y'] = -self.ball_velocity['y']
        
        if self.ball_pos['x'] <= 0:  # Si la balle passe à gauche, on marque un point pour le joueur droit
            self.score['right'] += 1
            self.reset_ball()

        if self.ball_pos['x'] >= 100:  # Si la balle passe à droite, on marque un point pour le joueur gauche
            self.score['left'] += 1
            self.reset_ball()

        # Logique pour gérer les collisions avec les paddles
        if self.ball_pos['x'] <= 5 and self.paddle_left['y'] - 5 <= self.ball_pos['y'] <= self.paddle_left['y'] + 5:
            self.ball_velocity['x'] = -self.ball_velocity['x']

        if self.ball_pos['x'] >= 95 and self.paddle_right['y'] - 5 <= self.ball_pos['y'] <= self.paddle_right['y'] + 5:
            self.ball_velocity['x'] = -self.ball_velocity['x']

    def reset_ball(self):
        self.ball_pos = {'x': 50, 'y': 50}
        self.ball_velocity = {'x': 1, 'y': 1}

    def update_paddle(self, paddle, direction):
        if paddle == "left":
            self.paddle_left['y'] += direction
        elif paddle == "right":
            self.paddle_right['y'] += direction
