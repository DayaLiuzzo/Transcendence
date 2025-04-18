import BasePlayView from "./BasePlayView.js";
import { cleanUpThree } from "../three/utils.js";

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

		this.initSettings = (event) => {
			this.setDataObjects(event.detail);
		};
		this.updateGame = (event) => {
			this.updateGameObjects(event.detail);
		};
		this.updateScoreBoard = (event) => {
			this.updateScore(event.detail);
		};
		this.gameEnd = (event) => {
			isRunning = false;
			this.handleGameEnd(
				event.detail,
				this.player1,
				this.player2
			);
		};
	}

	unmount() {
		document.getElementById("final-screen")?.remove();
		isRunning = false;
		if (this.socketService) {
			this.socketService.closeConnection();
			this.socketService = null;
			cleanUpThree();
		}
		window.removeEventListener("initSettingsGame", this.initSettings);
		window.removeEventListener("updateGame", this.updateGame);
		window.removeEventListener("updateScore", this.updateScoreBoard);
		window.removeEventListener("handleEndGame", this.gameEnd);
	}

	showError(message) {
		this.customAlert(message);
	}

	handlerEventsListeners() {
		const cursor = { x: 0, y: 0 };
		window.addEventListener("mousemove", (event) => {
			cursor.x = event.clientX / window.innerWidth - 0.5;
			cursor.y = -(event.clientY / window.innerHeight - 0.5);
		});
		window.addEventListener("initSettingsGame", this.initSettings);
		window.addEventListener("updateGame", this.updateGame);
		window.addEventListener("updateScore", this.updateScoreBoard);
		window.addEventListener("handleEndGame", this.gameEnd);
	}

	initGame() {
		isRunning = true;
		const canvas = document.querySelector("canvas.webgl");
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(
			95,
			this.gameBoard.width / this.gameBoard.height,
			40,
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
		controls.maxPolarAngle = Math.PI / 2.5;
		controls.minPolarAngle = Math.PI / 3;

		function resizeHandler() {
			const sizes = {
				width: window.innerWidth,
				height: window.innerHeight,
			};
			window.threeInstance.camera.aspect = sizes.width / sizes.height;
			window.threeInstance.camera.updateProjectionMatrix();
			window.threeInstance.renderer.setSize(sizes.width, sizes.height);
			window.threeInstance.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		}

		window.threeInstance = {
			scene,
			camera,
			renderer,
			controls,
			canvas,
			resizeHandler
		};

		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
		directionalLight.position.set(0, 0, -1);
		directionalLight.castShadow = true;
		directionalLight.shadow.mapSize.width = 2048;
		directionalLight.shadow.mapSize.height = 2048;
		window.threeInstance.scene.add(directionalLight);

		this.player1Spotlight = this.createSpotlight();
		this.player2Spotlight = this.createSpotlight();
		window.threeInstance.scene.add(this.player1Spotlight);
		window.threeInstance.scene.add(this.player1Spotlight.target);
		window.threeInstance.scene.add(this.player2Spotlight);
		window.threeInstance.scene.add(this.player2Spotlight.target);

		const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
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
			this.ball.x - this.centerX,
			this.ball.y - this.centerY,
			16
		);
		const colorBoard = new THREE.Color( 0x7da17e );
		const meshBoard = new THREE.Mesh(
			new THREE.PlaneGeometry(this.gameBoard.width, this.gameBoard.height),
			new THREE.MeshStandardMaterial({
				color: colorBoard,
				roughness: 0.6,
				metalness: 0.2,
			})
		);
		meshBoard.rotation.x -= Math.PI;
		meshBoard.position.z = 35;
		meshBoard.receiveShadow = true;

		const boardLine = new THREE.Mesh(
			new THREE.PlaneGeometry(10, this.gameBoard.height),
			new THREE.MeshStandardMaterial({
				color: 0x98b6b0,
				emissive: 0x98b6b0,
				emissiveIntensity: 0.2,
			})
		);
		boardLine.position.z = 34
		boardLine.position.y = 0;
		boardLine.rotation.x -= Math.PI ;

		this.createNameMesh();
		window.threeInstance.scene.add(boardLine);
		window.threeInstance.scene.add(meshBoard);
		window.threeInstance.scene.add(this.meshPlayer1);
		window.threeInstance.scene.add(this.meshPlayer2);
		window.threeInstance.scene.add(this.meshBall);
		this.updateScoreMesh();

		const tick = () => {
			if (isRunning === false) return;
			requestAnimationFrame(tick);
			this.updateSpotlight(this.player1Spotlight, this.meshPlayer1);
			this.updateSpotlight(this.player2Spotlight, this.meshPlayer2);
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

	updateSpotlight(spotlight, targetMesh) {
		spotlight.position.set(
			targetMesh.position.x,
			targetMesh.position.y,
			-600
		);
		spotlight.target.position.copy(targetMesh.position);
	}


	createSpotlight(intensity = 2) {
		const spotlight = new THREE.SpotLight(0x98b6b0, intensity);
		spotlight.angle -= Math.PI / 4;
		spotlight.decay = 2;
		spotlight.penumbra = 0.8;
		spotlight.intensity = 1;
		spotlight.distance = -5;
		spotlight.target.position.set(0, 0, 0);
		spotlight.position.set(0, 0, -600);
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
		this.player1.x = data.player1.x - this.centerX + data.player_width / 2;
		this.player1.y = data.player1.y - this.centerY + data.player_height / 2;
		this.player1.username = data.player1.username;
		this.player1.width = data.player_width;
		this.player1.height = data.player_height;
		this.player2.x = data.player2.x - this.centerX + data.player_width / 2;
		this.player2.y = data.player2.y - this.centerY + data.player_height / 2;
		this.player2.username = data.player2.username;
		this.player2.width = data.player_width ;
		this.player2.height = data.player_height;
		this.ball.x = data.ball.x - this.centerX + data.ball_radius;
		this.ball.y = data.ball.y - this.centerY + data.ball_radius;
		this.scores.player1_score = 0;
		this.scores.player2_score = 0;

		this.initGame();
	}

	updateGameObjects(data) {
		if (this.meshPlayer1 && this.meshPlayer2 && this.meshBall) {
			this.meshPlayer1.position.y = data.player1_y - this.centerY + this.player1.height / 2;
			this.meshPlayer2.position.y = data.player2_y - this.centerY + this.player2.height / 2;
			this.meshBall.position.y = data.ball.y - this.centerY + this.ballRadius / 2;
			this.meshBall.position.x = data.ball.x - this.centerX + this.ballRadius / 2;
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

		const colorText = new THREE.Color( 0x163f38 );
		const fontLoader = new THREE.FontLoader();
		fontLoader.load(
			"https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
			(font) => {
				const textMaterial = new THREE.MeshStandardMaterial({
					color: colorText,
					emissive: 0x00000,
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

	createNameMesh() {
		const colorText = new THREE.Color(  0x98b6b0 );
		const fontLoader = new THREE.FontLoader();
		fontLoader.load(
			"https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
			(font) => {
				const textMaterial = new THREE.MeshStandardMaterial({
					color: colorText,
					emissive: colorText,
					emissiveIntensity: 0.4,
				});
				const createNameText = (name, position) => {
					const geometry = new THREE.TextGeometry(name, {
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

				this.meshPlayer1Name = createNameText(
					this.player1.username,
					new THREE.Vector3(-this.centerX + 100, 20, -150)
				);
				this.meshPlayer2Name = createNameText(
					this.player2.username,
					new THREE.Vector3(this.centerX - 100, 20, -150)
				);

				window.threeInstance.scene.add(this.meshPlayer1Name);
				window.threeInstance.scene.add(this.meshPlayer2Name);
			}
		);
	}

	attachEvents() {

		this.handlerEventsListeners();
	}
}
