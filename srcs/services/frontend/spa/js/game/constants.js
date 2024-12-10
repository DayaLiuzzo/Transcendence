// Terrain
export const FIELD_WIDTH = 1000;
export const FIELD_HEIGHT = 500;
export const FIELD_COLOR = 0x00FF00;

// Paddles
export const PADDLE_WIDTH = 20;
export const PADDLE_HEIGHT = 20;
export const PADDLE_DEPTH = 200;
export const PADDLE_Z = PADDLE_HEIGHT / 2;
export const PADDLE1_COLOR = 0xFF69B4; // Rose
export const PADDLE2_COLOR = 0x0000FF; // Bleu
export const PADDLE1_POSITION = { x: - (FIELD_WIDTH / 2) + (PADDLE_WIDTH / 2) , y: 0, z: PADDLE_Z };
export const PADDLE2_POSITION = { x: FIELD_WIDTH / 2 - (PADDLE_WIDTH / 2), y: 0, z: PADDLE_Z };

// Ball
export const BALL_RADIUS = 10;
export const BALL_COLOR = 0xFF0000;
export const BALL_INITIAL_POSITION = { x: 0, y: BALL_RADIUS / 2, z: 0 };

// Camera
export const CAMERA_INITIAL_POSITION = { x: 0, y: 200, z: 500 };
export const CAMERA_FOV = 75;
export const CAMERA_NEAR = 0.1;
export const CAMERA_FAR = 1000;

// Light
export const LIGHT_POSITION = { x: 100, y: 100, z: 300 };
export const LIGHT_COLOR = 0xFFFFFF;
export const LIGHT_INTENSITY = 1;
