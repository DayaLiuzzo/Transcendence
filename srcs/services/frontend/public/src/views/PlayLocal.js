import { cleanUpThree } from "../three/utils.js";
import BaseView from "./BaseView.js";
//import { FontLoader } from
// import { TextGeometry } from "https://https://unpkg.com/three@0.126.0/examples/jsm//geometries/TextGeometry.js"
// import { FontLoader } from "https://unpkg.com/three@v0.126.0-qHpLjSttpMdFq2EjKvPI/mode=raw/examples/jsm/loaders/FontLoader.js"


let keys = { w: false, s: false, ArrowUp: false, ArrowDown: false };
let gameOver = false;

export default class PlayCanva extends BaseView {
	constructor(params) {
		super(params);


	}

	handlerEventsListeners() {
		const cursor = { x: 0, y: 0 };

		window.addEventListener("mousemove", (event) => {
			cursor.x = event.clientX / window.innerWidth - 0.5;
			cursor.y = -(event.clientY / window.innerHeight - 0.5);
		});

		window.addEventListener("keydown", (event) => {
			if (keys.hasOwnProperty(event.key)) {
				keys[event.key] = true;
			}
		});

		window.addEventListener("keyup", (event) => {
			if (keys.hasOwnProperty(event.key)) {
				keys[event.key] = false;
			}
		});

	}

	initGame() {
		console.log("Game Loading...");

		const canvas = document.querySelector("canvas.webgl");

		const scene = new THREE.Scene();
		//scene.background = new THREE.Color(0x000000);

		const camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.set(0, 5, 10);
		camera.lookAt(0, 0, 0);

		const renderer = new THREE.WebGLRenderer({
			canvas: canvas,
			alpha: true,
		});
		renderer.setSize(window.innerWidth, window.innerHeight);

		const controls = new THREE.OrbitControls(camera, renderer.domElement);
		controls.enablePan = false;
		controls.enableDamping = true;
		controls.enableZoom = true;
		controls.maxPolarAngle = Math.PI / 2.1;
		controls.minPolarAngle = Math.PI / 2.5;

		const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		directionalLight.position.set(5, 10, 5);
		directionalLight.castShadow = true;
		directionalLight.shadow.mapSize.width = 2048;
		directionalLight.shadow.mapSize.height = 2048;
		scene.add(directionalLight);

		const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
		scene.add(ambientLight);

		const ballSpotlight = new THREE.SpotLight(0xffffff, 10);
		ballSpotlight.angle = Math.PI / 6;
		ballSpotlight.penumbra = 0.3;
		ballSpotlight.decay = 1;
		ballSpotlight.distance = 10;
		ballSpotlight.castShadow = true;
		scene.add(ballSpotlight);
		scene.add(ballSpotlight.target);

		const paddleMaterial = new THREE.MeshStandardMaterial({
			color: 0xffffff,
			roughness: 0.2,
			metalness: 1.5,
			emissive: 0xffffff,
			emissiveIntensity: 0.4,
		});

		const meshPlayer1 = new THREE.Mesh(
			new THREE.BoxGeometry(0.5, 0.1, 1.5),
			paddleMaterial
		);
		meshPlayer1.position.set(-4.5, 0.5, 0);

		const meshPlayer2 = new THREE.Mesh(
			new THREE.BoxGeometry(0.5, 0.1, 1.5),
			paddleMaterial
		);
		meshPlayer2.position.set(4.5, 0.5, 0);

		const meshBall = new THREE.Mesh(
			new THREE.SphereGeometry(0.2, 32, 32),
			paddleMaterial
		);
		meshBall.position.set(0, 0.2, 0);

		const meshBoard = new THREE.Mesh(
			new THREE.PlaneGeometry(10, 6),
			new THREE.MeshStandardMaterial({
				color: 0x000000,
				roughness: 0.7,
				metalness: 0.3
			})
		);
		meshBoard.rotation.x = -Math.PI / 2;
		meshBoard.receiveShadow = true;

		const boardLine = new THREE.Mesh(
			new THREE.PlaneGeometry(0.05, 6),
			new THREE.MeshStandardMaterial({
				color: 0xffffff,
				emissive: 0xffffff,
				emissiveIntensity: 0.2,
			})
		);
		boardLine.rotation.x = -Math.PI / 2;
		boardLine.position.y = 0.01;
		scene.add(boardLine);

		scene.add(meshBoard);
		scene.add(meshPlayer1);
		scene.add(meshPlayer2);
		scene.add(meshBall);

		const particleCount = 100;
		const particleGeometry = new THREE.BufferGeometry();
		const particleMaterial = new THREE.PointsMaterial({
			color: 0xffffff,
			size: 0.05,
			transparent: true,
			opacity: 0.8,
		});

		const particlePositions = new Float32Array(particleCount * 3);
		particleGeometry.setAttribute(
			"position",
			new THREE.BufferAttribute(particlePositions, 3)
		);
		const particles = new THREE.Points(particleGeometry, particleMaterial);
		scene.add(particles);

		let activeParticles = [];

		let leftScoreText;
		let rightScoreText;
		const fontLoader = new THREE.FontLoader();
		console.log (fontLoader)
		fontLoader.load( 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
			const textMaterial = new THREE.MeshStandardMaterial({
				color: 0x000000,
				emissive: 0xffffff,
				emissiveIntensity: 0.4
			  });
		const createScoreText = (score, position) => {
			const geometry = new THREE.TextGeometry(score.toString(), {
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

		let ballVelocity = { x: 0.05, z: 0.02 };
		let scores = { left: 0, right: 0 };
		const scoreElement = document.getElementById("score");
		console.log(scoreElement)

		function createCollisionParticles(position) {
			for (let i = 0; i < particleCount; i++) {
				activeParticles.push({
					position: position.clone(),
					velocity: new THREE.Vector3(
						(Math.random() - 0.5) * 0.2,
						Math.random() * 0.2,
						(Math.random() - 0.5) * 0.2
					),
					life: 1.0,
				});
			}
		}

		function updateParticles() {
			activeParticles = activeParticles.filter((particle) => {
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

			particles.geometry.setAttribute(
				"position",
				new THREE.BufferAttribute(positions, 3)
			);
			particles.geometry.attributes.position.needsUpdate = true;
		}

		function resetBall() {
			meshBall.position.set(0, 0.2, 0);
			ballVelocity = {
				x: (Math.random() > 0.5 ? 1 : -1) * 0.05,
				z: (Math.random() - 0.5) * 0.05,
			};
		}

		// HERE FUNCTION TO UPDATE THE SCORES (HANDLE THE DISPLAY IN 3D)
		function updateScore() {

		const fontLoader = new THREE.FontLoader();
		fontLoader.load( 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
			const textMaterial = new THREE.MeshStandardMaterial({
				color: 0x000000,
				emissive: 0xffffff,
				emissiveIntensity: 0.4
			  });
			scoreElement.textContent = `${scores.left} - ${scores.right}`;
			if (leftScoreText && rightScoreText) {
			  scene.remove(leftScoreText);
			  scene.remove(rightScoreText);

			  const textMaterial = leftScoreText.material;
			  leftScoreText = new THREE.TextGeometry(scores.left.toString(), {
				font: font,
				size: 0.5,
				height: 0.1
			  });
			  rightScoreText = new THREE.TextGeometry(scores.right.toString(), {
				font: font,
				size: 0.5,
				height: 0.1
			  });

			  leftScoreText = new THREE.Mesh(leftScoreText, textMaterial);
			  rightScoreText = new THREE.Mesh(rightScoreText, textMaterial);

			  leftScoreText.position.set(-2, 2, 0);
			  rightScoreText.position.set(2, 2, 0);

			  scene.add(leftScoreText);
			  scene.add(rightScoreText);

			  if (scores.left >= 5 || scores.right >= 5) {
				alert(`Le joueur ${scores.left >= 5 ? "1" : "2"} a gagné !`);
				gameOver = true;

			}
			}
		  })};

		const clock = new THREE.Clock();
		const tick = () => {
			if (gameOver === true)
			{
				resetBall();
				return;
			}
			requestAnimationFrame(tick);

			// PADDLE POSITION UPDATE
			if (keys.w && meshPlayer1.position.z > -2)
				meshPlayer1.position.z -= 0.1;
			if (keys.s && meshPlayer1.position.z < 2)
				meshPlayer1.position.z += 0.1;
			if (keys.ArrowUp && meshPlayer2.position.z > -2)
				meshPlayer2.position.z -= 0.1;
			if (keys.ArrowDown && meshPlayer2.position.z < 2)
				meshPlayer2.position.z += 0.1;

			// BALL POS UPDATE
			meshBall.position.x += ballVelocity.x;
			meshBall.position.z += ballVelocity.z;

			ballSpotlight.position.set(
				meshBall.position.x,
				3,
				meshBall.position.z
			);
			ballSpotlight.target.position.copy(meshBall.position);
			updateParticles();
			if (meshBall.position.z > 2.5 || meshBall.position.z < -2.5) {
				ballVelocity.z *= -1;
				createCollisionParticles(meshBall.position);
			}
			if ((meshBall.position.x <= meshPlayer1.position.x + 0.3 &&
					meshBall.position.x >= meshPlayer1.position.x - 0.3 &&
					Math.abs(meshBall.position.z - meshPlayer1.position.z) <
						0.8) ||
				(meshBall.position.x >= meshPlayer2.position.x - 0.3 &&
					meshBall.position.x <= meshPlayer2.position.x + 0.3 &&
					Math.abs(meshBall.position.z - meshPlayer2.position.z) <
						0.8)
			) {
				ballVelocity.x *= -1.1;
				createCollisionParticles(meshBall.position);
			}
			if (meshBall.position.x > 4.5) {
				scores.left++;
				updateScore();
				resetBall();
			} else if (meshBall.position.x < -4.5) {
				scores.right++;
				updateScore();
				resetBall();
			}
			window.addEventListener("resize", () => {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize(window.innerWidth, window.innerHeight);
			});
			controls.update();

			window.addEventListener("resize", () => {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize(window.innerWidth, window.innerHeight);
			});

			renderer.render(scene, camera);
		};
		resetBall();
		tick();
	}

	render() {
		return `
        <div id="container-canvas">
            <canvas class="webgl"></canvas>
			<div id="score"></div>
        </div>
    `;
	}

	attachEvents() {
		console.log("Events attached (PlayCanva)");
		this.handlerEventsListeners();
		this.initGame();
	}
}
