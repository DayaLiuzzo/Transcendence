import BasePlayView from "./BasePlayView.js";

let keys = { a: false, d: false, ArrowLeft: false, ArrowRight: false };

export default class PlayCanva extends BasePlayView {
    constructor(params) {
        super(params);
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
	}

	// SI PB SYNCHRO AVEC LE BACK CE SERA PEUT ETRE LIE AU DELTA TIME QUI PERMET DE SYNCHRONISER LES FRAMES INDEPENDAMMENT DE LA FPS (CAR CA BUG EN FONCTION DES NAV ET HARDWARE ETC)
	displayPaddle(meshPaddle, positionDuBack, deltaTime) {
		const LEFT = -1;
		const RIGHT = 1;

		const paddleSpeed = 0.1;
		if (positionDuBack === LEFT)
			meshPaddle.position.x -= paddleSpeed * deltaTime;
		else if (positionDuBack === RIGHT)
			meshPaddle.position.x += paddleSpeed * deltaTime;
		else {
			console.log("INVALID POSITION");
			meshPaddle.position.x = meshPaddle.position.x;
		}
	}

	displayBall(meshBall, positionXDuBack, positionYDuBack, deltaTime) {
		meshBall.position.y = positionYDuBack * deltaTime;
		meshBall.position.x = positionXDuBack * deltaTime;
	}

	initGame() {
		console.log("Game Loading...");

		// ON SELECTIONNE LES ELEMENTS HTML NECESSAIRES POUR METTRE EN PLACE NOTRE SCENE
		const canvas = document.querySelector("canvas.webgl");
		//	const container = document.getElementById("container-canvas-game-canva");
		//	const asciiOutput = document.getElementById("ascii-output");

		console.log("Canvas: ", canvas);
		//console.log(container);
		//console.log(asciiOutput);

		// CREATION DE LA SCENE THREEJS && CHARGER LES MODELES 3D GLTF VIA LE LOADER DE THREEJS
		const scene = new THREE.Scene();
		console.log(scene);
		// const gltfLoader = new THREE.GLTFLoader();
		// console.log(gltfLoader);

		// gltfLoader.load(
		//     "../../assets/models/",
		//     (gltf) => {
		//         console.log(gltf);
		//         scene.add(gltf.scene);
		//     }
		// );

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

			//updatePaddles(meshPaddleLeft, meshPaddleRight);
			//launchBall(meshBall);
			//updateBall(meshBall, meshPaddleLeft, meshPaddleRight);
			//this.displayPaddle(meshPaddleLeft, meshPaddleRight, deltaTime);



			/** LES DEUX FONCTIONS A DECOMMENTER POUR DISPLAY AVEC POSITIONS DU BACK */
			//this.displayPaddle(meshPaddleLeft, positionDuBack, deltaTime);
			//this.displayBall(meshBall, positionXDuBack, positionYDuBack, deltaTime);


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

	attachEvents() {
		console.log("Events attached (PlayCanva)");
		// appeler les events ici pour eviter lags potentiels dans fonction tick (animation frame by frame)
		this.handlerEventsListeners();
		this.initGame();
	}
}

