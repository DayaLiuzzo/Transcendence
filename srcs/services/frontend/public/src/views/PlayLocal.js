import { cleanUpThree } from "../three/utils.js";
import BaseView from "./BaseView.js";

export default class PlayCanva extends BaseView{
	constructor(params) {
		super(params);

		this.ballVelocity = { x: 0.02, z: 0.02 };
		this.speedIncrement = 1.8;
		this.keys = { ArrowUp: false, ArrowDown: false, w: false, s:false};
		this.gameOver = false;

		this.scores = {
			max_score: 3,
			player1_score: 0,
			player2_score: 0,
		};
	}

	unmount() {
		document.getElementById("final-screen")?.remove();
		this.gameOver = true;
		cleanUpThree();
	}

	handlerEventsListeners() {
		const cursor = { x: 0, y: 0 };

		window.addEventListener("mousemove", (event) => {
			cursor.x = event.clientX / window.innerWidth - 0.5;
			cursor.y = -(event.clientY / window.innerHeight - 0.5);
		});

		window.addEventListener("keydown", (event) => {
			if (this.keys.hasOwnProperty(event.key)) {
				this.keys[event.key] = true;
			}
		});

		window.addEventListener("keyup", (event) => {
			if (this.keys.hasOwnProperty(event.key)) {
				this.keys[event.key] = false;
			}
		});
	}

    handleGameEnd(winner, looser, winner_score, looser_score){

		this.gameOver = true;

        const finalScreen = document.createElement("div");
        finalScreen.id = "final-screen";
        finalScreen.innerHTML = `
            <h1>Game Over</h1>
            <p>${winner} wins!</p>
            <p>score: ${winner} ${winner_score} - ${looser} ${looser_score}</p>
            <button id="back-to-lobby">Back to Lobby</button>
        `;
        finalScreen.style.cssText = `
            position: absolute;
            top: 5: 50%;
            transform: translate(-50%, -50%);
            padding: 20px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: center;

        `;
        document.body.appendChild(finalScreen);
        document.getElementById("back-to-lobby").addEventListener("click", () => {
			document.body.removeChild(finalScreen);
			this.gameOver = false;
            this.navigateTo("/play-menu");
        });
	}

	resetScores() {
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
						size: 0.5,
						height: 0.1,
					});
					const mesh = new THREE.Mesh(geometry, textMaterial);
					mesh.position.copy(position);
					return mesh;
				};

				if (this.scores.player1_score_text) {
					window.threeInstance.scene.remove(this.scores.player1_score_text);
				}
				if (this.scores.player2_score_text) {
					window.threeInstance.scene.remove(this.scores.player2_score_text);
				}

				this.scores.player1_score_text = createScoreText(
					this.scores.player1_score,
					new THREE.Vector3(-2, 2, 0)
				);
				this.scores.player2_score_text = createScoreText(
					this.scores.player2_score,
					new THREE.Vector3(2, 2, 0)
				);
				window.threeInstance.scene.add(this.scores.player1_score_text);
				window.threeInstance.scene.add(this.scores.player2_score_text);

					if (this.scores.player1_score >= 3 || this.scores.player2_score >= 3) {
						if (this.scores.player1_score >= 3) {
							this.handleGameEnd("Player 1", "Player 2", this.scores.player1_score, this.scores.player2_score);
						} else {
							this.handleGameEnd("Player 2", "Player 1", this.scores.player2_score, this.scores.player1_score);
						}
					}
				});
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

	initGame() {


		const canvas = document.querySelector("canvas.webgl");
		const scene = new THREE.Scene();

		const camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.lookAt(0, 0, 0);

		const renderer = new THREE.WebGLRenderer({
			canvas: canvas,
			alpha: true,
			antialias: true
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		const controls = new THREE.OrbitControls(camera, renderer.domElement);
		controls.enablePan = false;
		controls.enableDamping = true;
		controls.enableZoom = true;
		controls.maxPolarAngle = Math.PI / 4;
		controls.minPolarAngle = Math.PI / 3.8;
		controls.enableRotate = true;
		controls.minDistance = 5;
		controls.maxDistance = 10;
		camera.position.set(0, 10, 8);
		controls.minAzimuthAngle = -Math.PI / 4;
		controls.maxAzimuthAngle = Math.PI / 4;

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
			resizeHandler,
			animationId: null,
		};

		const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		directionalLight.position.set(5, 10, 5);
		directionalLight.castShadow = true;
		directionalLight.shadow.mapSize.width = 2048;
		directionalLight.shadow.mapSize.height = 2048;
		window.threeInstance.scene.add(directionalLight);

		const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
		window.threeInstance.scene.add(ambientLight);

		const ballSpotlight = this.createSpotlight(scene);
		const player1Spotlight = this.createSpotlight(scene);
		const player2Spotlight = this.createSpotlight(scene);

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
				metalness: 0.3,
			})
		);
		meshBoard.rotation.x = -Math.PI / 2;
		meshBoard.receiveShadow = true;

		const boardLine = new THREE.Mesh(
			new THREE.PlaneGeometry(0.05, 6),
			new THREE.MeshStandardMaterial({
				color: 0x000000,
				emissive: 0xffffff,
				emissiveIntensity: 0.2,
			})
		);
		boardLine.rotation.x = -Math.PI / 2;
		boardLine.position.y = 0.01;

		window.threeInstance.scene.add(boardLine);
		window.threeInstance.scene.add(meshBoard);
		window.threeInstance.scene.add(meshPlayer1);
		window.threeInstance.scene.add(meshPlayer2);
		window.threeInstance.scene.add(meshBall);

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
		window.threeInstance.scene.add(particles);
		let activeParticles = [];
		this.resetScores();

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

		const tick = () => {
			 if (this.gameOver === true) return;
			requestAnimationFrame(tick);

			if (this.keys.w && meshPlayer1.position.z > -2)
				meshPlayer1.position.z -= 0.1;
			if (this.keys.s && meshPlayer1.position.z < 2)
				meshPlayer1.position.z += 0.1;
			if (this.keys.ArrowUp && meshPlayer2.position.z > -2)
				meshPlayer2.position.z -= 0.1;
			if (this.keys.ArrowDown && meshPlayer2.position.z < 2)
				meshPlayer2.position.z += 0.1;

			meshBall.position.x += this.ballVelocity.x * this.speedIncrement;
			meshBall.position.z += this.ballVelocity.z * this.speedIncrement;

			this.updateSpotlight(ballSpotlight, meshBall);
			this.updateSpotlight(player1Spotlight, meshPlayer1);
			this.updateSpotlight(player2Spotlight, meshPlayer2);

			updateParticles();
			if (meshBall.position.z > 2.5 || meshBall.position.z < -2.5) {
				this.ballVelocity.z *= -1;
				createCollisionParticles(meshBall.position);
			}
			if (
				(meshBall.position.x <= meshPlayer1.position.x + 0.3 &&
					meshBall.position.x >= meshPlayer1.position.x - 0.3 &&
					Math.abs(meshBall.position.z - meshPlayer1.position.z) <
						0.8) ||
				(meshBall.position.x >= meshPlayer2.position.x - 0.3 &&
					meshBall.position.x <= meshPlayer2.position.x + 0.3 &&
					Math.abs(meshBall.position.z - meshPlayer2.position.z) <
						0.8)
			) {
				this.ballVelocity.x *= -1;
				createCollisionParticles(meshBall.position);
			}
			if (meshBall.position.x > 4.5) {
				this.scores.player1_score++;
				this.resetScores();
				meshBall.position.set(0, 0.2, 0);
			} else if (meshBall.position.x < -4.5) {
				this.scores.player2_score++;
				this.resetScores();
				meshBall.position.set(0, 0.2, 0);
			}
			window.addEventListener("resize", window.threeInstance.resizeHandler);
			window.threeInstance.controls.update();
			window.threeInstance.renderer.render(window.threeInstance.scene, window.threeInstance.camera);
		};
		if (this.gameOver === false) {
			meshBall.position.set(0, 0.2, 0);
			tick();
		}
	}

	render() {
		return `
		        <div>
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
        <div id="container-canvas">
            <canvas class="webgl"></canvas>
			<div id="score"></div>
        </div>
    `;
	}

	attachEvents() {
		this.handlerEventsListeners();
		if (this.gameOver === false) {
			this.initGame();
		}
	}
}
