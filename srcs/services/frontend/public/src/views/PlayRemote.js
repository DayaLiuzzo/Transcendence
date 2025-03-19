import BasePlayView from "./BasePlayView.js";

let keys = { a: false, d: false, ArrowLeft: false, ArrowRight: false };
let isRunning = false;

export default class PlayCanva extends BasePlayView {
	constructor(params) {
		super(params);

		window.threeInstance = {
			scene,
			camera,
			renderer,
			effect,
			controls,
			animationId: null,
			canvas,
			container,
		};

		this.player1 = { x: null, y: null, width: null, height: null };
		this.player2 = { x: null, y: null, width: null, height: null };
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

		this.scene = null;
		this.renderer = null;
		this.camera = null;
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
		this.listenToKeyboard();
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
			this.endGame(event.detail);
		});
	}

	initGame() {
		console.log("Game Loading...");
		const canvas = document.querySelector("canvas.webgl");
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(
			75,
			this.gameBoard.width / this.gameBoard.height,
			1,
			50000
		);
		this.camera.position.z = 900;
		this.camera.up = new THREE.Vector3(0, 0, -1);
		this.scene.add(this.camera);

		this.renderer = new THREE.WebGLRenderer({
			canvas: canvas,
			alpha: true,
		});
		this.renderer.setSize(window.innerWidth, window.innerHeight);

		const controls = new THREE.OrbitControls(
			this.camera,
			this.renderer.domElement
		);
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
		this.scene.add(directionalLight);

		const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
		this.scene.add(ambientLight);

		const ballSpotlight = new THREE.SpotLight(0xffffff, 10);
		ballSpotlight.angle = Math.PI / 6;
		ballSpotlight.penumbra = 0.3;
		ballSpotlight.decay = 1;
		ballSpotlight.distance = 10;
		ballSpotlight.castShadow = true;
		this.scene.add(ballSpotlight);
		this.scene.add(ballSpotlight.target);

		const paddleMaterial = new THREE.MeshStandardMaterial({
			color: 0xffffff,
			roughness: 0.2,
			metalness: 1.5,
			emissive: 0xffffff,
			emissiveIntensity: 0.4,
		});

		const meshPlayer1 = new THREE.Mesh(
			new THREE.BoxGeometry(this.player1.width, this.player1.height, 10),
			paddleMaterial
		);
		this.meshPlayer1.position.set(
			this.player1.x - this.centerX,
			this.player1.y - this.centerY,
			20
		);
		console.log("MESHPLAYER1", this.meshPlayer1);

		const meshPlayer2 = new THREE.Mesh(
			new THREE.BoxGeometry(this.player2.width, this.player2.height, 10),
			paddleMaterial
		);
		this.meshPlayer2.position.set(
			this.player2.x - this.centerX,
			this.meshPlayer2.y - this.centerY,
			20
		);

		//const meshBall = new THREE.Mesh(
		// 	new THREE.SphereGeometry(this.ballRadius, 16, 16),
		// 	paddleMaterial
		// );
		const meshBall = new THREE.Mesh(
			new THREE.BoxGeometry(
				this.ballRadius,
				this.ballRadius,
				this.ballRadius
			),
			paddleMaterial
		);
		this.meshBall.castShadow = true;
		this.meshBall.position.set(
			this.ball.x - this.centerX,
			this.ball.y - this.centerY,
			16
		);

		const meshBoard = new THREE.Mesh(
			new THREE.PlaneGeometry(
				this.gameBoard.width,
				this.gameBoard.height
			),
			new THREE.MeshStandardMaterial({
				color: 0x000000,
				roughness: 0.7,
				metalness: 0.3,
			})
		);
		meshBoard.rotation.x -= Math.PI;
		meshBoard.position.z = 35;
		meshBoard.receiveShadow = true;

		const boardLine = new THREE.Mesh(
			new THREE.PlaneGeometry(10, this.gameBoard.height),
			new THREE.MeshStandardMaterial({
				color: 0x00000,
				emissive: 0xffffff,
				emissiveIntensity: 0.2,
			})
		);
		boardLine.position.z = 34;

		this.scene.add(boardLine);
		this.scene.add(meshBoard);
		this.scene.add(this.meshPlayer1);
		this.scene.add(this.meshPlayer2);
		this.scene.add(this.meshBall);
		console.log("SCOOOOOORE:", this.scores.player1_score)
		this.updateScoreMesh();

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

		// OUTILS POUR DEBUG
		const axesHelper = new THREE.AxesHelper(5);
		this.scene.add(axesHelper);

		const gridHelper = new THREE.GridHelper(this.gameBoard.width, 10);
		this.scene.add(gridHelper);

		const tick = () => {
			if (isRunning === false) return;
			requestAnimationFrame(tick);

			ballSpotlight.position.set(
				this.meshBall.position.x,
				3,
				this.meshBall.position.z
			);
			ballSpotlight.target.position.copy(this.meshBall.position);

			window.addEventListener("resize", () => {
				const newWidth = window.innerWidth;
				const newHeight = window.innerHeight;
				const newAspect = newWidth / newHeight;

				this.camera.aspect = newAspect;
				this.camera.updateProjectionMatrix();
				this.renderer.setSize(newWidth, newHeight);
			});
			controls.update();
			this.renderer.render(this.scene, this.camera);
		};

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
			<div id="room-id"></div>
			<div id="user-1"></div>
			<div id="user-2"></div>
			<div id="container-canvas">
				<canvas class="webgl"></canvas>
				<div id="ascii-output"></div>
				<div id="scores"></div>
			</div>
				<div id="response-result"></div>
			</div>
		</div>
    `;
	}

	setDataObjects(data) {
		this.gameBoard.height = data.height;
		console.log("UPDATED HEIGHT:", this.gameBoard.height);
		this.gameBoard.width = data.width;
		this.centerY = data.height / 2;
		this.centerX = data.width / 2;
		this.ballRadius = data.ball_radius;
		this.scores.max_scores = data.max_scores;
		this.scores.winner = false;
		this.player1.x = data.player1.x;
		this.player1.y = data.player1.y;
		this.player1.width = data.player_width;
		this.player1.height = data.player_height;
		this.player2.x = data.player2.x ;
		this.player2.y = data.player2.y ;
		this.player2.width = data.player_width ;
		this.player2.height = data.player_height;
		this.ball.x = data.ball.x ;
		this.ball.y = data.ball.y;


		isRunning = true;
		this.initGame();
	}

	updateGameObjects(data) {
		if (this.meshPlayer1 && this.meshPlayer2 && this.meshBall) {
			this.meshPlayer1.position.y = data.player1_y - this.centerY;
			this.meshPlayer2.position.y = data.player2_y - this.centerY;
			this.meshBall.position.y = data.ball.y - this.centerY;
			this.meshBall.position.x = data.ball.x - this.centerX;
		}
	}

	updateScore(data) {
		this.scores.player1_score = data.player1;
		this.scores.player2_score = data.player2;
		this.updateScoreMesh();
	}

	updateScoreMesh() {
		if (this.meshPlayer1Score) {
			this.scene.remove(this.meshPlayer1Score);
		}
		if (this.meshPlayer2Score) {
			this.scene.remove(this.meshPlayer2Score);
		}

		const fontLoader = new THREE.FontLoader();
		fontLoader.load(
			"https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
			(font) => {
				const textMaterial = new THREE.MeshStandardMaterial({
					color: 0xffffff,
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

				this.scene.add(this.meshPlayer1Score);
				this.scene.add(this.meshPlayer2Score);
			}
		);
	}

	endGame(data) {
		// tout reset 0 + afficher winner + scoress + renvoyer bouton pour play menu
	}

	attachEvents() {
		console.log("Events attached (PlayCanva)");
		this.handlerEventsListeners();
	}
}
