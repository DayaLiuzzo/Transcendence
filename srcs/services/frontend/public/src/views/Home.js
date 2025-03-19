import BaseView from "./BaseView.js";

export default class Home extends BaseView {
	constructor(router, params) {
		super(router, params);
	}
	render() {
		if (this.isAuthenticated()) {
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

				<div id="test-text-container"><p>welcome to our</p> <p id="outstanding">outstanding </p><p id="test-text"> Pong
						Game </p></div>
					<div class="ascii-container">
					<canvas class="webgl"></canvas>
					<div id="ascii-output"></div>
				</div>
				<div id="follow-scroll-elements">
					<p>(↖ drag me please)</p>
				</div>
			</div>
              `;
		} else {
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
				<div id="test-text-container"><p>welcome to our</p> <p id="outstanding">outstanding </p><p id="test-text"> Pong
						Game </p></div>
					<div class="ascii-container">
					<canvas class="webgl"></canvas>
					<div id="ascii-output"></div>
				</div>
				<div id="follow-scroll-elements">
					<p>(↖ drag me please)</p>
				</div>
			</div>
              `;
		}
	}
	attachEvents() {
		console.log("Events attached (Home)");
		const text = document.getElementById("test-text");
		const originalText = text.textContent;

		text.innerHTML = originalText
			.split("")
			.map((char) => `<span>${char}</span>`)
			.join("");

		text.addEventListener("mouseover", () => {
			text.querySelectorAll("span").forEach((letter) => {
				const randomX = (Math.random() - 0.5) * 600;
				const randomY = (Math.random() - 0.5) * 600;
				letter.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${
					(Math.random() - 0.5) * 30
				}deg)`;

			});
		});
		text.addEventListener("mouseleave", () => {
			text.querySelectorAll("span").forEach((letter) => {
				letter.style.transform = "translate(0,0) rotate(0)";
			});
		});

		const cursor = { x: 0, y: 0 };
		window.addEventListener("mousemove", (event) => {
			cursor.x = event.clientX / window.innerWidth - 0.5;
			cursor.y = event.clientY / window.innerHeight - 0.5;
		});

		const canvas = document.querySelector("canvas.webgl");
		const container = document.querySelector(".ascii-container");
		const scene = new THREE.Scene();

		const gltfLoader = new THREE.GLTFLoader();
		gltfLoader.load("../../assets/imac_C.gltf", (gltf) => {
			scene.add(gltf.scene);
		});

		const light = new THREE.DirectionalLight(0xffffff, 1);
		light.position.set(2, 2, 2);
		scene.add(light);
		const sizes = {
			width: container.clientWidth,
			height: container.clientHeight,
		};
		const renderer = new THREE.WebGLRenderer({
			canvas: canvas,
			alpha: true,
			antialias: true,
		});
		renderer.setSize(sizes.width, sizes.height);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		const asciiChar = " .:-+*=%@";
		const effect = new THREE.AsciiEffect(renderer, asciiChar, {
			invert: false,
			resolution: 0.25,
			scale: 1,
		});
		effect.setSize(sizes.width, sizes.height);
		effect.domElement.style.color = "black";
		effect.domElement.style.backgroundColor = "none";

		effect.domElement.classList.add("ascii-effect");
		effect.domElement.style.cursor = "grab";
		document.querySelector("#ascii-output").appendChild(effect.domElement);
		canvas.style.display = "none";

		const camera = new THREE.PerspectiveCamera(
			75,
			sizes.width / sizes.height, 1, 10
		);
		camera.position.z = 1;
		//camera.position.x = -5;
		camera.position.y = 5;

		camera.lookAt(0, 0, 0);
		scene.add(camera);

		const controls = new THREE.OrbitControls(camera, effect.domElement);
		controls.enablePan = false;
		controls.enableDamping = true;
		controls.enableZoom = true;
		controls.maxPolarAngle = Math.PI / 2.1;
		controls.minPolarAngle = Math.PI / 2.5;
		//controls.minAzimuthAngle = -Math.PI / 4;
		//controls.maxAzimuthAngle = Math.PI / 4;
		controls.enableRotate = true;
		controls.minDistance = 5;
		controls.maxDistance = 8;
		controls.autoRotate = true;
		controls.autoRotateSpeed = 1;


		controls.target.set(2, 0, 0);
		renderer.domElement.style.cursor = "grab";

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

		const clock = new THREE.Clock();

		const tick = () => {
			const elapsedTime = clock.getElapsedTime();

			controls.update();
			window.threeInstance.effect.render(scene, camera);
			window.threeInstance.animationId = requestAnimationFrame(tick);
		};

		window.addEventListener("resize", () => {
			const rect = container.getBoundingClientRect();

			sizes.width = rect.width;
			sizes.height = rect.height;

			camera.aspect = sizes.width / sizes.height;
			camera.updateProjectionMatrix();

			window.threeInstance.renderer.setSize(sizes.width, sizes.height);
			window.threeInstance.effect.setSize(sizes.width, sizes.height);
			window.threeInstance.renderer.setPixelRatio(
				Math.min(window.devicePixelRatio, 2)
			);
		});

		tick();
	}
}
