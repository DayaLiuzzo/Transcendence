import BaseView from "./BaseView.js";

let keys = { a: false, d: false, ArrowLeft: false, ArrowRight: false };

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
			if (event.key === "ArrowLeft") {
				keys.ArrowLeft = true;
				console.log(keys.ArrowLeft);
				//this.displayPaddle(meshPaddleLeft, deltaTime, -1);
			}
			if (event.key === "ArrowRight") {
				keys.ArrowRight = true;
				console.log(keys.ArrowRight);
				console.log(keys);
				//this.displayPaddle(meshPaddleLeft, deltaTime, 1);
			}
			if (event.key === "a") {
				keys.a = true;
				console.log(keys.a);
				//this.displayPaddle(meshPaddleRight, deltaTime, -1);
			}
			if (event.key === "d") {
				keys.d = true;
				console.log(keys.d);
				//	this.displayPaddle(meshPaddleRight, deltaTime, 1);
			}
		});

		window.addEventListener('keyup', (event) => {
			if (event.key === 'ArrowLeft') {
				keys.ArrowLeft = false;
				console.log(keys.ArrowLeft);
			}
			if ( event.key === 'ArrowRight') {
				keys.ArrowRight = false;
				console.log(keys.ArrowRight);
				console.log(keys);
			}
			if (event.key === 'a') {
				keys.a = false;
				console.log(keys.a);
			}
			if ( event.key === 'd') {
				keys.d = false;
				console.log(keys.d);
			}
		});
	}

	displayPaddle(meshPaddleLeft, meshPaddleRight, deltaTime) {

		const paddleSpeed = 5;

		if (keys.ArrowLeft ) {
			meshPaddleLeft.position.x -= paddleSpeed * deltaTime;
			console.log(meshPaddleLeft.position.x);
		}
		if (keys.ArrowRight ) {
			meshPaddleLeft.position.x += paddleSpeed * deltaTime;
		}
		if (keys.a) {
			meshPaddleRight.position.x -= paddleSpeed * deltaTime;
		}
		if (keys.d) {
			meshPaddleRight.position.x += paddleSpeed * deltaTime;
		}
	}

	// updateBallPosition(meshBall, deltaTime) {
	// 	const ballSpeed = 0.1;
	// 	document.addEventListener('keydown', (event) => {
	// 		if (event.key == 'ArrowUp') {
	// 			meshBall.position.y += ballDirection.y * (ballSpeed * deltaTime);
	// 			console.log(meshBall.position.y);
	// 		}
	// 		if (event.key == 'ArrowDown') {
	// 			meshBall.position.y -= ballDirection.y * (ballSpeed * deltaTime);
	// 		}
	// });

	// }

	displayBall(meshBall, positionXDuBack, positionYDuBack, deltaTime) {
		meshBall.position.y = positionYDuBack * deltaTime;
		meshBall.position.x = positionXDuBack * deltaTime;
	}

	initGame() {
		console.log("Game Loading...");

		const canvas = document.querySelector("canvas.webgl");
		//	const container = document.getElementById("container-canvas-game-canva");
		//	const asciiOutput = document.getElementById("ascii-output");

		const scene = new THREE.Scene();

		const meshPaddleLeft = new THREE.Mesh(
			new THREE.BoxGeometry(40, 2, 1),
			new THREE.MeshBasicMaterial({ color: 0x000000 })
		);
		meshPaddleLeft.position.x = 3;
		meshPaddleLeft.position.y = -10;

		const meshPaddleRight = new THREE.Mesh(
			new THREE.BoxGeometry(40, 2, 1),
			new THREE.MeshBasicMaterial({ color: 0x000000 })
		);
		meshPaddleRight.position.x = 3;
		meshPaddleRight.position.y = 1.5;

		const meshBall = new THREE.Mesh(
			new THREE.SphereGeometry(0.5, 32, 32),
			new THREE.MeshBasicMaterial({ color: 0x000000 })
		);
		meshBall.position.y = 0;

		const sizes = {
			width: window.innerWidth,
			height: window.innerHeight,
		};
		console.log(sizes);

		scene.add(meshPaddleLeft);
		scene.add(meshPaddleRight);
		scene.add(meshBall);

		const light = new THREE.DirectionalLight(0xffffff, 1);
		light.position.set(2, 2, 2);
		scene.add(light);

		const renderer = new THREE.WebGLRenderer({
			canvas: canvas,
			alpha: true,
		});

		const asciiChar = " .";
		const effect = new THREE.AsciiEffect(renderer, asciiChar, {
			invert: false,
			resolution: 0.2,
			scale: 1,
		});
		effect.setSize(sizes.width, sizes.height);
		effect.domElement.style.color = "black";
		effect.domElement.style.backgroundColor = "none";

		//effect.domElement.classList.add("ascii-effect");
		//effect.domElement.style.cursor = "grab";
		//document.querySelector("#ascii-output").appendChild(effect.domElement);
		//canvas.style.display = "none";

		const camera = new THREE.PerspectiveCamera(
			75,
			sizes.width / sizes.height
		);
		camera.position.z = 20;

		//camera.position.y = 1;
		//camera.lookAt(meshPaddleLeft.position);
		//camera.lookAt(mesh.position);
		scene.add(camera);

		renderer.setSize(sizes.width, sizes.height);
		renderer.setPixelRatio(window.devicePixelRatio);

		//const controls = new THREE.OrbitControls(camera, effect.domElement);
		//renderer.domElement.style.cursor = "grab";
		const controls = new THREE.OrbitControls(camera, canvas);
		console.log(controls);
		controls.enableDamping = true;
		controls.enableZoom = true;

		const clock = new THREE.Clock();
		const tick = () => {
			let deltaTime = clock.getDelta();
			//const elapsedTime = clock.getElapsedTime();
			//meshPaddleLeft.rotation.y = elapsedTime * 0.5;
			//meshPaddleRight.rotation.y = elapsedTime * 0.5;
			//meshBall.rotation.y = elapsedTime * 0.5;
			//meshBall.position.x = Math.sin(elapsedTime);

			this.displayPaddle(meshPaddleLeft, meshPaddleRight, deltaTime);

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

        <div id="container-canvas-game-canva">
            <canvas class="webgl"></canvas>
            <div id="ascii-output"></div>
        </div>
            <div id="response-result"></div>
        </div>
    `;
	}

	attachEvents() {
		console.log("Events attached (PlayCanva)");
		this.handlerEventsListeners();
		this.initGame();
	}
}
