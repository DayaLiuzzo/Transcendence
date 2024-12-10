// Importer les classes GameObject, Ball, Light, Camera et Field
import { GameObject, Ball, Light, Camera, Field, Paddle } from './gameClass.js';
import * as THREE from 'three'; // Assurez-vous que trois.js est correctement installé et accessible
import * as CONSTANTS from './constants.js'; // Importer les constantes

const scene = new THREE.Scene();

// Créer le terrain
const field = new Field(
    CONSTANTS.FIELD_WIDTH, 
    CONSTANTS.FIELD_HEIGHT, 
    CONSTANTS.FIELD_COLOR
);

// Créer les paddles
const paddle1 = new Paddle(
    CONSTANTS.PADDLE_WIDTH,
    CONSTANTS.PADDLE_HEIGHT,
    CONSTANTS.PADDLE_DEPTH,
    CONSTANTS.PADDLE1_COLOR,
    CONSTANTS.PADDLE1_POSITION.x,
    CONSTANTS.PADDLE1_POSITION.y,
    CONSTANTS.PADDLE1_POSITION.z
);

const paddle2 = new Paddle(
    CONSTANTS.PADDLE_WIDTH,
    CONSTANTS.PADDLE_HEIGHT,
    CONSTANTS.PADDLE_DEPTH,
    CONSTANTS.PADDLE2_COLOR,
    CONSTANTS.PADDLE2_POSITION.x,
    CONSTANTS.PADDLE2_POSITION.y,
    CONSTANTS.PADDLE2_POSITION.z
);

// Créer la balle
const ball = new Ball(
    CONSTANTS.BALL_RADIUS,
    CONSTANTS.BALL_COLOR,
    CONSTANTS.BALL_INITIAL_POSITION.x,
    CONSTANTS.BALL_INITIAL_POSITION.y,
    CONSTANTS.BALL_INITIAL_POSITION.z
);

// Créer la caméra
const camera = new Camera(
    CONSTANTS.CAMERA_INITIAL_POSITION.x,
    CONSTANTS.CAMERA_INITIAL_POSITION.y,
    CONSTANTS.CAMERA_INITIAL_POSITION.z,
    CONSTANTS.CAMERA_FOV,
    CONSTANTS.CAMERA_NEAR,
    CONSTANTS.CAMERA_FAR
);

// Créer la lumière
const light = new Light(
    CONSTANTS.LIGHT_POSITION.x,
    CONSTANTS.LIGHT_POSITION.y,
    CONSTANTS.LIGHT_POSITION.z,
    CONSTANTS.LIGHT_COLOR,
    CONSTANTS.LIGHT_INTENSITY
);

// Ajouter les objets à la scène de rendu
scene.add(field.mesh);
scene.add(paddle1.mesh);
scene.add(paddle2.mesh);
scene.add(ball.mesh);
scene.add(camera.mesh);
scene.add(light.mesh);

// Définir la caméra comme contrôleur principal
camera.camera.lookAt(ball.mesh.position);

// Créer le renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Render de la scène
function animate() {
    requestAnimationFrame(animate);

    // Update camera position and look at ball (for example, simple follow)
    camera.mesh.position.copy(ball.mesh.position);

    // Render the scene
    renderer.render(scene, camera.camera);
}

// Lancer l'animation
animate();
