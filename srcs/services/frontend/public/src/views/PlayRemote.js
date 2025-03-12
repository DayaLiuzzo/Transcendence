import BasePlayView from "./BasePlayView.js";

let keys = { a: false, d: false, ArrowLeft: false, ArrowRight: false };

export default class PlayCanva extends BasePlayView {

    constructor(params) {
        super(params);

		this.meshPaddleLeft = null;
		this.meshPaddleRight = null;
		this.meshBall = null;
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

		window.addEventListener("updateGame", (event) => {
			this.updateGameObjects(event.detail);
		});

	}

	initGame() {
		console.log("Game Loading...");
		const canvas = document.querySelector("canvas.webgl");
		//	const container = document.getElementById("container-canvas-game-canva");
		//	const asciiOutput = document.getElementById("ascii-output");

		console.log("Canvas: ", canvas);
		//console.log(container);
		//console.log(asciiOutput);

		const scene = new THREE.Scene();
		console.log(scene);

		this.meshPlayer1 = new THREE.Mesh(
			new THREE.BoxGeometry(40, 2, 1),
			new THREE.MeshBasicMaterial({ color: 0x000000 })
		);
		this.meshPlayer1.position.x = 3;
		this.meshPlayer1.position.y = -10;

		this.meshPlayer2 = new THREE.Mesh(
			new THREE.BoxGeometry(40, 2, 1),
			new THREE.MeshBasicMaterial({ color: 0x000000 })
		);
		this.meshPlayer2.position.x = 3;
		this.meshPlayer2.position.y = 1.5;

		this.meshBall = new THREE.Mesh(
			new THREE.SphereGeometry(0.5, 32, 32),
			new THREE.MeshBasicMaterial({ color: 0x000000 })
		);
		this.meshBall.position.y = 0;

		const sizes = {
			width: window.innerWidth,
			height: window.innerHeight,
		};
		console.log(sizes);

		scene.add(this.meshPlayer1);
		scene.add(this.meshPlayer2);
		scene.add(this.meshBall);

		const light = new THREE.DirectionalLight(0xffffff, 1);
		light.position.set(2, 2, 2);
		scene.add(light);

		const renderer = new THREE.WebGLRenderer({
			canvas: canvas,
			alpha: true,
		});

		// const asciiChar = " .";
		// const effect = new THREE.AsciiEffect(renderer, asciiChar, {
		// 	invert: false,
		// 	resolution: 0.2,
		// 	scale: 1,
		// });
		// effect.setSize(sizes.width, sizes.height);
		// effect.domElement.style.color = "black";
		// effect.domElement.style.backgroundColor = "none";

		//effect.domElement.classList.add("ascii-effect");
		//effect.domElement.style.cursor = "grab";
		//document.querySelector("#ascii-output").appendChild(effect.domElement);
		//canvas.style.display = "none";

		const camera = new THREE.PerspectiveCamera(
			75,
			sizes.width / sizes.height
		);
		camera.position.z = 20;
		scene.add(camera);

		renderer.setSize(sizes.width, sizes.height);
		renderer.setPixelRatio(window.devicePixelRatio);

		//const controls = new THREE.OrbitControls(camera, effect.domElement);
		//renderer.domElement.style.cursor = "grab";
		const controls = new THREE.OrbitControls(camera, canvas);
		console.log(controls);
		controls.enableDamping = true;
		controls.enableZoom = true;

		const tick = () => {
			controls.update();
			renderer.render(scene, camera);
			//effect.render(scene, camera);
			//effect.animationId = requestAnimationFrame(tick);
			//window.threeInstance.animationId = requestAnimationFrame(tick);
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

	updateGameObjects(data) {
		if (this.this.meshPlayer1 && this.this.meshPlayer2 && this.this.meshBall) {
			this.this.meshPlayer1.position.y = data.player1.y;
			this.this.meshPlayer1.position.x = data.player1.x;
			this.this.meshPlayer2.position.y = data.player2.y;
			this.this.meshPlayer2.position.x = data.player2.x;
			this.this.meshBall.position.y = data.ball.y;
			this.this.meshBall.position.x = data.ball.x;
		}
	}

	attachEvents() {
		console.log("Events attached (PlayCanva)");
		this.handlerEventsListeners();
		// handle message de start partie
		this.initGame();
	}
}

