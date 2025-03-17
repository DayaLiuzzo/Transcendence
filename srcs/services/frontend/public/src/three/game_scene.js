/*************************
 * CANVAS DE BASE POUR DEMARRER *
**************************/

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

// Renderer with post-processing
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enablePan = false;
controls.maxPolarAngle = Math.PI / 2.1;
controls.minPolarAngle = Math.PI / 2.5;

// Lights
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

// Spotlight following the ball
const ballSpotlight = new THREE.SpotLight(0xffffff, 2);
ballSpotlight.angle = Math.PI / 6;
ballSpotlight.penumbra = 0.3;
ballSpotlight.decay = 1;
ballSpotlight.distance = 10;
ballSpotlight.castShadow = true;
scene.add(ballSpotlight);
scene.add(ballSpotlight.target);

// Court
const court = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 6),
  new THREE.MeshStandardMaterial({
    color: 0x000000,
    roughness: 0.7,
    metalness: 0.3
  })
);
court.rotation.x = -Math.PI / 2;
court.receiveShadow = true;
scene.add(court);

// Court line
const courtLine = new THREE.Mesh(
  new THREE.PlaneGeometry(0.05, 6),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 0.2
  })
);
courtLine.rotation.x = -Math.PI / 2;
courtLine.position.y = 0.01;
scene.add(courtLine);

// Paddles with glow effect
const paddleMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.2,
  metalness: 1.5,
  emissive: 0xffffff,
  emissiveIntensity: 0.4
});

const leftPaddle = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.1, 1.5),
  paddleMaterial
);
leftPaddle.position.set(-4.5, 0.5, 0);
leftPaddle.castShadow = true;
scene.add(leftPaddle);

const rightPaddle = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.1, 1.5),
  paddleMaterial
);
rightPaddle.position.set(4.5, 0.5, 0);
rightPaddle.castShadow = true;
scene.add(rightPaddle);

// Ball with trail effect
const ballGeometry = new THREE.SphereGeometry(0.2, 32, 32);
const ballMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.1,
  metalness: 0.9,
  emissive: 0xffffff,
  emissiveIntensity: 0.6
});
const ball = new THREE.Mesh(ballGeometry, ballMaterial);
ball.position.set(0, 0.2, 0);
ball.castShadow = true;
scene.add(ball);

// Trail effect
const trailPoints = [];
const maxTrailLength = 20;
const trailGeometry = new THREE.BufferGeometry();
const trailMaterial = new THREE.LineBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.5
});
const trail = new THREE.Line(trailGeometry, trailMaterial);
scene.add(trail);

// Particle system for collisions
const particleCount = 100;
const particleGeometry = new THREE.BufferGeometry();
const particleMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.05,
  transparent: true,
  opacity: 0.8
});

const particlePositions = new Float32Array(particleCount * 3);
particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

let activeParticles = [];

// 3D Score display
let leftScoreText, rightScoreText;
const fontLoader = new FontLoader();
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
  const textMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 0.4
  });

  const createScoreText = (score, position) => {
    const geometry = new TextGeometry(score.toString(), {
      font: font,
      size: 0.5,
      height: 0.1
    });
    const mesh = new THREE.Mesh(geometry, textMaterial);
    mesh.position.copy(position);
    return mesh;
  };

  leftScoreText = createScoreText('0', new THREE.Vector3(-2, 2, 0));
  rightScoreText = createScoreText('0', new THREE.Vector3(2, 2, 0));
  scene.add(leftScoreText);
  scene.add(rightScoreText);
});

// Game state
let ballVelocity = { x: 0.05, z: 0.02 };
let scores = { left: 0, right: 0 };
const scoreElement = document.getElementById('score');

// Particle effect on collision
function createCollisionParticles(position) {
  for (let i = 0; i < particleCount; i++) {
    activeParticles.push({
      position: position.clone(),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        Math.random() * 0.2,
        (Math.random() - 0.5) * 0.2
      ),
      life: 1.0
    });
  }
}

// Update particle positions
function updateParticles() {
  activeParticles = activeParticles.filter(particle => {
    particle.position.add(particle.velocity);
    particle.life -= 0.02;
    return particle.life > 0;
  });

  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < activeParticles.length; i++) {
    const particle = activeParticles[i];
    positions[i * 3] = particle.position.x;
    positions[i * 3 + 1] = particle.position.y;
    positions[i * 3 + 2] = particle.position.z;
  }

  particles.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particles.geometry.attributes.position.needsUpdate = true;
}

// Reset ball
function resetBall() {
  ball.position.set(0, 0.2, 0);
  ballVelocity = {
    x: (Math.random() > 0.5 ? 1 : -1) * 0.05,
    z: (Math.random() - 0.5) * 0.04
  };
  trailPoints.length = 0;
}

// Update score display
function updateScore() {
  scoreElement.textContent = `${scores.left} - ${scores.right}`;
  if (leftScoreText && rightScoreText) {
    scene.remove(leftScoreText);
    scene.remove(rightScoreText);

    const textMaterial = leftScoreText.material;
    leftScoreText = new TextGeometry(scores.left.toString(), {
      font: leftScoreText.geometry.parameters.font,
      size: 0.5,
      height: 0.1
    });
    rightScoreText = new TextGeometry(scores.right.toString(), {
      font: rightScoreText.geometry.parameters.font,
      size: 0.5,
      height: 0.1
    });

    leftScoreText = new THREE.Mesh(leftScoreText, textMaterial);
    rightScoreText = new THREE.Mesh(rightScoreText, textMaterial);

    leftScoreText.position.set(-2, 2, 0);
    rightScoreText.position.set(2, 2, 0);

    scene.add(leftScoreText);
    scene.add(rightScoreText);
  }
}

// Keyboard controls
const keys = {
  w: false,
  s: false,
  ArrowUp: false,
  ArrowDown: false
};

window.addEventListener('keydown', (e) => {
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = true;
  }
});

window.addEventListener('keyup', (e) => {
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = false;
  }
});

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Update paddles
  if (keys.w && leftPaddle.position.z > -2) leftPaddle.position.z -= 0.1;
  if (keys.s && leftPaddle.position.z < 2) leftPaddle.position.z += 0.1;
  if (keys.ArrowUp && rightPaddle.position.z > -2) rightPaddle.position.z -= 0.1;
  if (keys.ArrowDown && rightPaddle.position.z < 2) rightPaddle.position.z += 0.1;

  // Update ball position and trail
  ball.position.x += ballVelocity.x;
  ball.position.z += ballVelocity.z;

  // Update spotlight position to follow ball
  ballSpotlight.position.set(ball.position.x, 3, ball.position.z);
  ballSpotlight.target.position.copy(ball.position);

  // Update trail
  trailPoints.unshift(ball.position.clone());
  if (trailPoints.length > maxTrailLength) {
    trailPoints.pop();
  }

  const positions = new Float32Array(trailPoints.length * 3);
  trailPoints.forEach((point, i) => {
    positions[i * 3] = point.x;
    positions[i * 3 + 1] = point.y;
    positions[i * 3 + 2] = point.z;
  });

  trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  trailGeometry.attributes.position.needsUpdate = true;

  // Update particles
  updateParticles();

  // Ball collision with court boundaries
  if (ball.position.z > 2.5 || ball.position.z < -2.5) {
    ballVelocity.z *= -1;
    createCollisionParticles(ball.position);
  }

  // Ball collision with paddles
  if (
    (ball.position.x <= leftPaddle.position.x + 0.3 &&
      ball.position.x >= leftPaddle.position.x - 0.3 &&
      Math.abs(ball.position.z - leftPaddle.position.z) < 0.8) ||
    (ball.position.x >= rightPaddle.position.x - 0.3 &&
      ball.position.x <= rightPaddle.position.x + 0.3 &&
      Math.abs(ball.position.z - rightPaddle.position.z) < 0.8)
  ) {
    ballVelocity.x *= -1.1; // Reverse direction and increase speed
    createCollisionParticles(ball.position);
  }

  // Scoring
  if (ball.position.x > 4.5) {
    scores.left++;
    updateScore();
    resetBall();
  } else if (ball.position.x < -4.5) {
    scores.right++;
    updateScore();
    resetBall();
  }

  renderer.render(scene, camera);
}

// Start the game
resetBall();
animate();
