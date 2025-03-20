import BasePlayView from "./BasePlayViewTournament.js";
import { cleanUpThree } from "../three/utils.js";

let keys = { a: false, d: false, ArrowLeft: false, ArrowRight: false };
let isRunning = false;
let gameOver = false;

export default class PlayCanva extends BasePlayView {
	constructor(params) {
		super(params);

		this.player1 = { x: null, y: null, width: null, height: null, username: null };
		this.player2 = { x: null, y: null, width: null, height: null, username: null };
		this.ball = { x: null, y: null };
		this.gameBoard = { width: null, height: null };
		this.ballRadius = null;
		this.scores = {
			winner: null,
			max_score: null,
			looser: null,
			player1_score: 0,
			player2_score: 0,
		};
		this.centerX = null;
		this.centerY = null;

		this.renderer = null;
		this.camera = null;
	}

	unmount() {
		console.log("Unmounted PlayCanva REMOTE");
		document.getElementById("final-screen")?.remove();
		isRunning = false;
		if (this.socketService) {
			this.socketService.closeConnection();
			this.socketService = null;
			cleanUpThree();
		}
	}

	showError(message) {
		alert(message);
	}

	handlerEventsListeners() {
		const cursor = { x: 0, y: 0 };
		window.addEventListener("mousemove", (event) => {
			cursor.x = event.clientX / window.innerWidth - 0.5;
			cursor.y = -(event.clientY / window.innerHeight - 0.5);
		});
		window.addEventListener("initSettingsGame", (event) => {
			this.setDataObjects(event.detail);
		});
		window.addEventListener("updateGame", (event) => {
			this.updateGameObjects(event.detail);
		});
		window.addEventListener("updateScore", (event) => {
			this.updateScore(event.detail);
		});
		window.addEventListener("handleEndGame", (event) => {
			isRunning = false;
			this.handleGameEnd(
				event.detail,
				this.player1,
				this.player2
			);
		});
	}

	initGame() {
		console.log("Game Loading...");
		const canvas = document.querySelector("canvas.webgl");
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(
			75,
			this.gameBoard.width / this.gameBoard.height,
			1,
			50000
		);
		camera.position.z = 900;
		camera.up = new THREE.Vector3(0, 0, -1);
		scene.add(camera);

		const renderer = new THREE.WebGLRenderer({
			canvas: canvas,
			alpha: true,
			antialias: true,
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		const controls = new THREE.OrbitControls(
			camera,
			renderer.domElement
		);
		controls.enablePan = false;
		controls.enableDamping = true;
		controls.enableZoom = true;
		controls.maxPolarAngle = Math.PI / 2.1;
		controls.minPolarAngle = Math.PI / 2.5;

		function resizeHandler() {
			sizes.width = container.clientWidth;
			sizes.height = container.clientHeight;

			window.threeInstance.camera.aspect = sizes.width / sizes.height;
			window.threeInstance.camera.updateProjectionMatrix();

			window.threeInstance.renderer.setSize(sizes.width, sizes.height);
			window.threeInstance.effect.setSize(sizes.width, sizes.height);
		}

		window.threeInstance = {
			scene,
			camera,
			renderer,
			controls,
			canvas,
			resizeHandler
		};

		const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		directionalLight.position.set(5, 10, 5);
		directionalLight.castShadow = true;
		directionalLight.shadow.mapSize.width = 2048;
		directionalLight.shadow.mapSize.height = 2048;
		window.threeInstance.scene.add(directionalLight);

		this.ballSpotlight = this.createSpotlight(scene);
		this.player1Spotlight = this.createSpotlight(scene);
		this.player2Spotlight = this.createSpotlight(scene);

		const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
		window.threeInstance.scene.add(ambientLight);

		const paddleMaterial = new THREE.MeshStandardMaterial({
			color: 0xffffff,
			roughness: 0.2,
			metalness: 1.5,
			emissive: 0xffffff,
			emissiveIntensity: 0.4,
		});

		this.meshPlayer1 = new THREE.Mesh(
			new THREE.BoxGeometry(this.player1.width, this.player1.height, 10),
			paddleMaterial
		);
		this.meshPlayer1.position.set(
			this.player1.x,
			this.player1.y,
			20
		);
		console.log("MESHPLAYER1", this.meshPlayer1);

		this.meshPlayer2 = new THREE.Mesh(
			new THREE.BoxGeometry(this.player2.width, this.player2.height, 10),
			paddleMaterial
		);
		this.meshPlayer2.position.set(
			this.player2.x,
			this.meshPlayer2.y,
			20
		);

		this.meshBall = new THREE.Mesh(
			new THREE.BoxGeometry(
				this.ballRadius,
				this.ballRadius,
				this.ballRadius
			),
			paddleMaterial
		);
		this.meshBall.castShadow = true;
		this.meshBall.position.set(
			this.ball.x,
			this.ball.y,
			16
		);
		const boardColor = new THREE.Color(0xD3D3D3);
		const meshBoard = new THREE.Mesh(
			new THREE.PlaneGeometry(this.gameBoard.width, this.gameBoard.height),
			new THREE.MeshStandardMaterial({
				color: boardColor,
				roughness: 0.6,
				metalness: 0.2,
			})
		);
		meshBoard.rotation.x -= Math.PI;
		meshBoard.position.z = 35;
		meshBoard.receiveShadow = true;
		scene.add(meshBoard);

		const boardLine = new THREE.Mesh(
			new THREE.PlaneGeometry(10, this.gameBoard.height),
			new THREE.MeshStandardMaterial({
				color: 0x00000,
				emissive: 0xffffff,
				emissiveIntensity: 0.2,
			})
		);
		boardLine.position.z = 34;

		window.threeInstance.scene.add(boardLine);
		window.threeInstance.scene.add(meshBoard);
		window.threeInstance.scene.add(this.meshPlayer1);
		window.threeInstance.scene.add(this.meshPlayer2);
		window.threeInstance.scene.add(this.meshBall);
		console.log("SCOOOOOORE:", this.scores.player1_score)
		this.updateScoreMesh();

		const tick = () => {
			if (isRunning === false) return;
			requestAnimationFrame(tick);

			window.addEventListener("resize", window.threeInstance.resizeHandler);
			window.threeInstance.controls.update();
			window.threeInstance.renderer.render(window.threeInstance.scene, window.threeInstance.camera);
		};
		if (gameOver === false)
			tick();
	}

	render() {
		return `
		<div id="header">
			<div>
				<button id="button-nav">
				<i class="menuIcon material-icons">menu</i>
				<i class="closeIcon material-icons" style="display: none;" >close</i>
				</button>
				<nav id="navbar">
				</nav>
			</div>
			<div id="line"></div>
			</div>
		</div>
		<div id="container">
			<h2>Play remote</h2>
			<div id="status"></div>
			<div id="room-id"></div>
			<div id="user-1"></div>
			<div id="user-2"></div>
			<div id="container-canvas">
				<canvas class="webgl"></canvas>
				<div id="scores"></div>
			</div>
				<div id="response-result"></div>
			</div>
		</div>
    `;
	}

	updateSpotlight(spotlight, targetMesh) {
		spotlight.position.set(targetMesh.position.x, 3, targetMesh.position.z);
		spotlight.target.position.copy(targetMesh.position);
	}

	createSpotlight(scene, intensity = 10) {
		const spotlight = new THREE.SpotLight(0xffffff, intensity);
		spotlight.angle = Math.PI / 6;
		spotlight.penumbra = 0.3;
		spotlight.decay = 1;
		spotlight.distance = 10;
		spotlight.castShadow = true;

		scene.add(spotlight);
		scene.add(spotlight.target);

		return spotlight;
	}

	setDataObjects(data) {
		this.gameBoard.height = data.height;
		this.gameBoard.width = data.width;
		this.centerY = data.height / 2;
		this.centerX = data.width / 2;
		this.ballRadius = data.ball_radius;
		this.scores.max_scores = data.max_scores;
		this.scores.winner = false;
		this.player1 = data.player1;
		this.player1.x = data.player1.x - this.centerX + data.player_width / 2;
		this.player1.y = data.player1.y - this.centerY + data.player_width / 2;
		this.player1.username = data.player1.username;
		this.player1.width = data.player_width;
		this.player1.height = data.player_height;
		this.player2.x = data.player2.x - this.centerX + data.player_width / 2;
		this.player2.y = data.player2.y - this.centerY + data.player_width / 2;
		this.player2.username = data.player2.username;
		this.player2.width = data.player_width ;
		this.player2.height = data.player_height;
		this.ball.x = data.ball.x - this.centerX + data.ball_radius;
		this.ball.y = data.ball.y - this.centerY + data.ball_radius;
		this.score_player1 = 0;
		this.score_player2 = 0;

		isRunning = true;
		this.initGame();
	}

	updateGameObjects(data) {
		if (this.meshPlayer1 && this.meshPlayer2 && this.meshBall) {
			this.meshPlayer1.position.y = data.player1_y - this.centerY + this.player1.height / 2;
			this.meshPlayer2.position.y = data.player2_y - this.centerY + this.player2.height / 2;
			this.meshBall.position.y = data.ball.y - this.centerY + this.ballRadius / 2;
			this.meshBall.position.x = data.ball.x - this.centerX + this.ballRadius / 2;
			this.updateSpotlight(this.ballSpotlight, this.meshBall);
			this.updateSpotlight(this.player1Spotlight, this.meshPlayer1);
			this.updateSpotlight(this.player2Spotlight, this.meshPlayer2);
		}
	}

	updateScore(data) {
		this.scores.player1_score = data.player1;
		this.scores.player2_score = data.player2;
		this.updateScoreMesh();
	}

	updateScoreMesh() {
		if (this.meshPlayer1Score) {
			window.threeInstance.scene.remove(this.meshPlayer1Score);
		}
		if (this.meshPlayer2Score) {
			window.threeInstance.scene.remove(this.meshPlayer2Score);
		}

		const fontLoader = new THREE.FontLoader();
		fontLoader.load(
			"https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
			(font) => {
				const textMaterial = new THREE.MeshStandardMaterial({
					color: 0x000000,
					emissive: 0xffffff,
					emissiveIntensity: 0.4,
				});

				const createScoreText = (score, position) => {
					const geometry = new THREE.TextGeometry(score.toString(), {
						font: font,
						size: 50,
						height: 0.1,
					});
					const mesh = new THREE.Mesh(geometry, textMaterial);
					mesh.position.copy(position);
					mesh.castShadow = true;
					mesh.rotation.x = - Math.PI / 2;
					mesh.rotation.z = 0;
					return mesh;
				};

				this.meshPlayer1Score = createScoreText(
					this.scores.player1_score,
					new THREE.Vector3(-this.centerX + 100, 20, -50)
				);
				this.meshPlayer2Score = createScoreText(
					this.scores.player2_score,
					new THREE.Vector3(this.centerX - 100, 20, -80)
				);
				this.meshPlayer1Score.position.set(-this.centerX + 100, 20, -50);
				this.meshPlayer2Score.position.set(this.centerX - 100, 20, -80);

				window.threeInstance.scene.add(this.meshPlayer1Score);
				window.threeInstance.scene.add(this.meshPlayer2Score);
			}
		);
	}

	updateParticles() {
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

	handleCollision(data) {
		const position = new THREE.Vector3(data.x, data.y, 0);
		for (let i = 0; i < particleCount; i++) {
			activeParticles.push({
			position: position.clone(),
			velocity: new THREE.Vector3(
				(Math.random() - 0.5) * 0.2, Math.random() * 0.2,(Math.random() - 0.5) * 0.2),
				life: 1.0,
			});
		}
	}

	attachEvents() {
		console.log("Events attached (PlayCanva)");
		this.handlerEventsListeners();
	}
}
