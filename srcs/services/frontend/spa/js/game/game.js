import { GameObject, Ball, Light, Camera, Field, Paddle } from './gameClass.js';
import * as THREE from 'three'; // Assurez-vous que trois.js est correctement installé et accessible
import * as CONSTANTS from './constants.js'; // Importer les constantes
import WebSocketClient from './websockets.js';
import Renderer from './renderer.js'; // Importer le nouveau renderer
import { initializeScene } from './initScene.js';

const SERVER_URL = 'wss://game:8001';
const gameSocket = new WebSocketClient(SERVER_URL);

const { scene, camera, ball } = initializeScene();


const renderer = new Renderer(scene, camera.camera);

function updateObjects() {
    // Exemple : suivre la position de la balle avec la caméra
    camera.mesh.position.copy(ball.mesh.position);
}

// Lancer l'animation
renderer.animate(updateObjects);

