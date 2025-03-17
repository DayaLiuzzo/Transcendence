import BasePlayView from "./BasePlayView.js";

let keys = { a: false, d: false, ArrowLeft: false, ArrowRight: false };

export default class PlayCanva extends BasePlayView {

    constructor(params) {
        super(params);

		this.player1 = { x: null, y: null, width: null, height: null};
		this.player2 = { x: null, y: null, width: null, height: null};
		this.ball = { x: null, y: null };
		this.gameBoard = { width: null, height: null };
		this.ballRadius = null;
		this.score = { winner: null, max_score: null, player1_score: null, player2_score: null };
		this.centerX = null;
		this.centerY = null;

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
	}

	initGame() {
		console.log("Game Loading...");
		const canvas = document.querySelector("canvas.webgl");
		const scene = new THREE.Scene();

		const paddleMaterial = new THREE.MeshStandardMaterial({
		  color: 0xffffff,
		  roughness: 0.2,
		  metalness: 1.5,
		  emissive: 0xffffff,
		  emissiveIntensity: 0.4
		});

		this.meshPlayer1 = new THREE.Mesh(
			new THREE.BoxGeometry(this.player1.width, 1, this.player1.height),
			paddleMaterial
		);
		this.meshPlayer1.position.set((this.player1.x - this.centerX), 0, -(this.player1.y - this.centerY));
		console.log("MESHPLAYER1", this.meshPlayer1);

		this.meshPlayer2 = new THREE.Mesh(
			new THREE.BoxGeometry(this.player2.width, 1, this.player2.height),
			paddleMaterial
		);
		this.meshPlayer2.position.set((this.player2.x - this.centerX), 0, -(this.meshPlayer2.y - this.centerY));

		this.meshBall = new THREE.Mesh(
			new THREE.SphereGeometry(this.ballRadius, 16, 16),
			new THREE.MeshBasicMaterial({
				color: 0x000000,
				roughness: 0.1,
				metalness: 0.9,
				emissive: 0xffffff,
				emissiveIntensity: 0.6
			})
		);
		this.meshBall.castShadow = true;
		this.meshBall.position.set((this.ball.x - this.centerX), 0, -(this.ball.y - this.centerY));

		const meshBoard = new THREE.Mesh(
			new THREE.PlaneGeometry(this.gameBoard.width, this.gameBoard.height),
			new THREE.MeshStandardMaterial ({
				color: 0x000000,
				roughness: 0.7,
				metalness: 0.3
			})
		);
		meshBoard.rotation.x = -(Math.PI / 2);
		meshBoard.position.set(0, -2, -1);
		meshBoard.receiveShadow = true;
		scene.add(meshBoard);

		scene.add(this.meshPlayer1);
		scene.add(this.meshPlayer2);
		scene.add(this.meshBall);

		const light = new THREE.DirectionalLight(0xffffff, 1);
		light.position.set(10, 10, 10);
		light.castShadow = true;
		light.shadow.mapSize.width = this.gameBoard.width;
		light.shadow.mapSize.height = this.gameBoard.height;
		scene.add(light);

		const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
		scene.add(ambientLight);

		const ballSpotlight = new THREE.SpotLight(0xffffff, 2);
		ballSpotlight.angle = Math.PI / 6;
		ballSpotlight.penumbra = 0.3;
		ballSpotlight.decay = 1;
		ballSpotlight.distance = 10;
		ballSpotlight.castShadow = true;
		scene.add(ballSpotlight);
		scene.add(ballSpotlight.target);

		const aspectRatio = this.gameBoard.width / this.gameBoard.height;
		const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
		camera.position.set(0, 200, 200);
		camera.lookAt(0, 0, 0);
		scene.add(camera);

		const renderer = new THREE.WebGLRenderer({
			canvas: canvas,
			alpha: true,
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio, 2);


		//renderer.shadowMap.enabled = true;
		//renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		//document.body.appendChild(renderer.domElement);

		renderer.domElement.style.cursor = "grab";
		const controls = new THREE.OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.enableZoom = true;
		controls.maxPolarAngle = Math.PI / 2.1;
		controls.minPolarAngle = Math.PI / 2.5;

		const axesHelper = new THREE.AxesHelper(5);
		scene.add( axesHelper );

		const gridHelper = new THREE.GridHelper(this.gameBoard.width, 10);
		scene.add(gridHelper);

		const tick = () => {
			controls.update();
			renderer.render(scene, camera);

			ballSpotlight.position.set(this.meshBall.position.x, 3, this.meshBall.position.z);
			ballSpotlight.target.position.copy(this.meshBall.position);

			window.addEventListener("resize", () => {
				const newWidth = window.innerWidth;
				const newHeight = window.innerHeight;
				const newAspect = newWidth / newHeight;

				camera.aspect = newAspect;
				camera.updateProjectionMatrix();
				renderer.setSize(newWidth, newHeight);
			});
			requestAnimationFrame(tick);
		};

		tick();
	}

	render() {
		return `
        <div id="line"></div>
        <h2>Play remote</h2>
        <div id="room-id"></div>
        <div id="user-1"></div>
        <div id="user-2"></div>
        <div id="container-canvas">
            <canvas class="webgl"></canvas>
            <div id="ascii-output"></div>
        </div>
            <div id="response-result"></div>
        </div>
    `;
	}

	setDataObjects(data) {
		this.gameBoard.height = data.height;
		this.gameBoard.width = data.width;
		this.centerY = data.height / 2;
		this.centerX = data.width / 2;
		this.ballRadius = data.ball_radius;
		this.score.max_score = data.max_score;
		this.score.winner = false;
		this.player1_score = 0;
		this.player2_score = 0;
		this.player1.x = data.player1.x;
		this.player1.y = data.player1.y;
		this.player1.width = data.player_width;
		this.player1.height = data.player_height;
		this.player2.x = data.player2.x;
		this.player2.y = data.player2.y;
		this.player2.width = data.player_width;
		this.player2.height = data.player_height;
		this.ball.x = data.ball.x;
		this.ball.y = data.ball.y;

		this.initGame();
	}

	updateGameObjects(data) {
		if (this.meshPlayer1 && this.meshPlayer2 && this.meshBall) {
			this.meshPlayer1.position.z = -(data.player1_y - this.centerY);
			this.meshPlayer2.position.z = -(data.player2_y - this.centerY);
			this.meshBall.position.z -(data.ball.y - this.centerY);
			this.meshBall.position.x = data.ball.x - this.centerX;
		}
	}

	attachEvents() {
		console.log("Events attached (PlayCanva)");
		this.handlerEventsListeners();
	}
}

