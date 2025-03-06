import BasePlayView from './BasePlayView.js';

export default class PlayLocal extends BasePlayView{
    constructor(params){
        super(params);
    }

    showError(message){
        alert(message);
    }

    // initGame(){
    //     console.log("Game Loading...");

    //     // ON SELECTIONNE LES ELEMENTS HTML NECESSAIRES POUR METTRE EN PLACE NOTRE SCENE
    //     const canvas = document.querySelector(".webgl");
    //     const container = document.getElementById("container-canvas-game-local");
    //     const asciiOutput = document.getElementById("ascii-effect-output");

    //     // CREATION DE LA SCENE THREEJS && CHARGER LES MODELES 3D GLTF VIA LE LOADER DE THREEJS
    //     const scene = new THREE.Scene();
    //     // const gltfLoader = new THREE.GLTFLoader();
    //     // console.log(gltfLoader);

    //     // gltfLoader.load(
    //     //     "../../assets/models/",
    //     //     (gltf) => {
    //     //         console.log(gltf);
    //     //         scene.add(gltf.scene);
    //     //     }
    //     // );

    //     const meshPaddleLeft = new THREE.Mesh(
    //         new THREE.BoxGeometry(30, 1, 1),
    //         new THREE.MeshBasicMaterial({ color: 0xff0000 })
    //     );

    //     const meshPaddleRight = new THREE.Mesh(
    //         new THREE.BoxGeometry(30, 1, 1),
    //         new THREE.MeshBasicMaterial({ color: 0x0000ff })
    //     );

    //     const meshBall = new THREE.Mesh(
    //         new THREE.SphereGeometry(0.5, 32, 32),
    //         new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    //     );

    //     const sizes = {
    //         width: container.innerWidth,
    //         height: container.innerHeight
    //     };

    //     scene.add(meshPaddleLeft);
    //     scene.add(meshPaddleRight);
    //     scene.add(meshBall);

    //     const light = new THREE.DirectionalLight(0xffffff, 1);
    //     light.position.set(2, 2, 2);
    //     scene.add(light);

    //     const renderer = new THREE.WebGLRenderer({
	// 		canvas: canvas,
	// 		alpha: true,
	// 	});
	// 	renderer.setSize(sizes.width, sizes.height);
	// 	renderer.setPixelRatio(window.devicePixelRatio);

    //     const asciiChar = " .:-+*=%@";
	// 	const effect = new THREE.AsciiEffect(renderer, asciiChar, {
	// 		invert: true,
	// 		resolution: 0.25,
	// 		scale: 1,
	// 	});
    //     effect.setSize(sizes.width, sizes.height);
	// 	effect.domElement.style.color = "black";
	// 	effect.domElement.style.backgroundColor = "none";

	// 	// on cache le rendu de base pour laisser apparaitre le rendu ascii
	// 	effect.domElement.classList.add("ascii-effect");
	// 	effect.domElement.style.cursor = "grab";
	// 	document.querySelector("#ascii-output").appendChild(effect.domElement);
	// 	canvas.style.display = "none";
	// 	// camera perspective etc
	// 	const camera = new THREE.PerspectiveCamera(
	// 		75,
	// 		sizes.width / sizes.height
	// 	);
	// 	camera.position.z = 1;
	// 	camera.position.y = 1;
	// 	camera.lookAt(0, 0, 0);
	// 	//camera.lookAt(mesh.position);
	// 	scene.add(camera);

	// 	// controls for the camera
	// 	const controls = new THREE.OrbitControls(camera, effect.domElement);
	// 	controls.enableDamping = true;
	// 	controls.enableZoom = true;
	// 	renderer.domElement.style.cursor = "grab";

	// 	window.threeInstance = {
	// 		scene,
	// 		camera,
	// 		renderer,
	// 		effect,
	// 		controls,
	// 		animationId: null,
	// 		canvas,
	// 		container,
	// 	};

	// 	const clock = new THREE.Clock();

	// 	const tick = () => {
	// 		const elapsedTime = clock.getElapsedTime();
	// 		//mesh.rotation.y = elapsedTime * 0.5;

	// 		controls.update();
	// 		window.threeInstance.effect.render(scene, camera);
	// 		window.threeInstance.animationId = requestAnimationFrame(tick);
	// 	};

	// 	window.addEventListener("resize", () => {
	// 		const rect = container.getBoundingClientRect();

	// 		sizes.width = rect.width;
	// 		sizes.height = rect.height;

	// 		camera.aspect = sizes.width / sizes.height;
	// 		camera.updateProjectionMatrix();

	// 		window.threeInstance.renderer.setSize(sizes.width, sizes.height);
	// 		window.threeInstance.effect.setSize(sizes.width, sizes.height);
	// 		window.threeInstance.renderer.setPixelRatio(
	// 			Math.min(window.devicePixelRatio, 2)
	// 		);
	// 	});

	// 	tick();

    // }


    render(){
        return `
        <div id="line"></div>

        <div id="container-canvas-game-local">
            <canvas class="webgl"></canvas>
            <div id="ascii-effect-output"></div>
        </div>
            <div id="response-result"></div>
        </div>
    `;
    }

    attachEvents(){
        console.log("Events attached (PlayLocal)");
     // this.initGame();
    }

}
