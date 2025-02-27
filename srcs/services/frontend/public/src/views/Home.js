import BaseView from './BaseView.js';

export default class Home extends BaseView{
    constructor(router, params){
        super(router,params);
    }
    render(){
      if (this.isAuthenticated())
        {
          return `
          <div id="line"></div>
          <div id="test-text-container"><p>welcome to our </p> <p id="test-text"> Pong Game </p></div>
  canvas class="webgl"></canvas>
  div id="follow-scroll-elements">
          <p>(↖ drag me please)</p>
          </div>
          </div>
              `;
            }
        else {
          return `
          <div id="line"></div>
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
    attachEvents(){
        console.log('Events attached (Home)');
        const text = document.getElementById("test-text");
        const originalText = text.textContent;

        text.innerHTML = originalText.split("").map(char => `<span>${char}</span>`).join("");

        console.log(text.innerHTML);

        text.addEventListener("mouseover", ()=> {
          text.querySelectorAll("span").forEach(letter => {
            const randomX = (Math.random() - 0.5) * 600;
            const randomY = (Math.random() - 0.5) * 600;
            letter.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${(Math.random() - 0.5) * 30}deg)`;
            console.log("mouse over");
          });
        });
        text.addEventListener("mouseleave", () => {
          console.log("mouse leave");
          text.querySelectorAll("span").forEach(letter => {
              console.log(letter);
              letter.style.transform = "translate(0,0) rotate(0)";
          });
      });


        // FONCTIONS A DEPLACER POUR UTILS MENU SLIDE, DOIVENT ETRE ACCESSIBLES PARTOUT
        // OPEN MENU
        const button = document.getElementById("button-nav");
        button.addEventListener("mouseover", () => {
          const navbar = document.getElementById("navbar");
          navbar.classList.toggle("active");
        });
        // CLOSE MENU
        button.addEventListener("mouseleave", () => {
          setTimeout(() => navbar.classList.remove("active"), 800);
        });

             //event listener pour detecter mouse moves
            const cursor = {x: 0, y: 0};
            window.addEventListener("mousemove", (event) => {
                cursor.x = event.clientX / window.innerWidth - 0.5;
                cursor.y = event.clientY / window.innerHeight - 0.5;
            });

            // Canvas pour le rendu 3D + creation objet box mesh attributs etc
            const canvas = document.querySelector('canvas.webgl');
            const container = document.querySelector('.ascii-container');
            const scene = new THREE.Scene();

            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(2, 2, 2);
            scene.add(light);
            const mesh = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1, 5, 5, 5),
                new THREE.MeshLambertMaterial({ color: 0x000000 })
            );
            const sizes = {
                width: container.clientWidth,
                height: container.clientHeight,
            }
            scene.add(mesh);

            // set le renderer de la scene 3d
            const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true } );
            renderer.setSize(sizes.width, sizes.height);
            renderer.setPixelRatio(window.devicePixelRatio);
            // ascii effect a appliquer sur le mesh
            const asciiChar = " .";
            const effect = new THREE.AsciiEffect(renderer, asciiChar, {
              invert: false,
              resolution: 0.25,
              scale: 1,
          });
          effect.setSize(sizes.width, sizes.height);
          effect.domElement.style.color = "black";
          effect.domElement.style.backgroundColor = "none";

          // on cache le rendu de base pour laisser apparaitre le rendu ascii
          effect.domElement.classList.add("ascii-effect");
          effect.domElement.style.cursor = "grab";
          document.querySelector("#ascii-output").appendChild(effect.domElement);
          canvas.style.display = "none";
           // camera perspective etc
           const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
           camera.position.z = 1;
           camera.lookAt(mesh.position);
            scene.add(camera);

            // controls for the camera
           const controls = new THREE.OrbitControls(camera, effect.domElement);
           controls.enableDamping = true;
           controls.enableZoom = false;
           renderer.domElement.style.cursor = "grab";

            window.threeInstance = {
              scene,
              camera,
              renderer,
              effect,
              controls,
              animationId: null,
              canvas,
              container
          };

          const clock = new THREE.Clock();
          const tick = () => {
            window.threeInstance.animationId = requestAnimationFrame(tick);
            const elapsedTime = clock.getElapsedTime();
            mesh.rotation.y = elapsedTime * 0.5;

            controls.update();
            window.threeInstance.effect.render(scene, camera);
          }

          window.addEventListener("resize", () => {
            const rect = container.getBoundingClientRect();

            sizes.width = rect.width
            sizes.height = rect.height

            camera.aspect = sizes.width / sizes.height;
            camera.updateProjectionMatrix();

            window.threeInstance.renderer.setSize(sizes.width, sizes.height);
            window.threeInstance.effect.setSize(sizes.width, sizes.height);
            window.threeInstance.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          });

          tick();
        };
};


