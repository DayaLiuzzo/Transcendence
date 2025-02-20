import BaseView from './BaseView.js';
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { AsciiEffect } from "three/examples/jsm/effects/AsciiEffect.js";
let connected = 1;


export default class Home extends BaseView{
    constructor(router, params){
        super(router,params);
    }
    async render(){
      if (this.isAuthenticated())
        {
          return `
          <h1></h1>
            <div button class="button-play">
            <a href="/game">Play me rn</a>

          <div id="follow-scroll-elements">
          <p>(drag me please ➔)</p>
          </div>
          <p id="test-text">

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum facilisis, orci eget gravida faucibus, dolor nulla fermentum nunc, vel bibendum justo ligula non massa. Sed at arcu et augue sollicitudin mollis. Nulla gravida, elit id suscipit semper, enim lectus mattis eros, eget tincidunt nulla mauris a erat. Phasellus in mollis ex, ac ultrices lectus. Nunc sed turpis non justo euismod facilisis. Suspendisse interdum mattis nisl ut viverra. Sed placerat diam augue, eget lacinia odio tincidunt sit amet. Nulla dignissim aliquam volutpat. Fusce in arcu placerat, finibus est sed, semper dui. Fusce vitae diam eros.

Cras a posuere dolor, sit amet dignissim nibh. Ut vel vestibulum nisi. Donec ullamcorper, lacus nec congue volutpat, elit nulla varius nibh, vel accumsan risus leo nec nisl. Quisque mi enim, imperdiet sit amet bibendum id, ornare nec elit. Donec maximus faucibus erat ut congue. Proin ut nisl dignissim, vestibulum arcu porttitor, pulvinar dui. Etiam ut ligula diam. Duis eget aliquam diam. Proin et eros sed nulla aliquet posuere. Curabitur eros massa, vehicula eu velit et, facilisis efficitur nisi. Aenean at fermentum sem. Pellentesque maximus lorem vitae ultricies commodo. Duis consectetur dolor et tortor tincidunt interdum. Vestibulum ullamcorper rutrum mi, ornare porttitor elit tempor sed. Donec quis ornare lorem. </p>
<canvas class="webgl"></canvas>
          </div>
              `;
            }
        else {
          return `
          <h1></h1>
          <div button class="button-play">
          <a href="/game">Play me rn</a>
          </div>
          <div id="follow-scroll-elements">
          <p>(I follow)</p>
          </div>
          <p id="test-text">

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum facilisis, orci eget gravida faucibus, dolor nulla fermentum nunc, vel bibendum justo ligula non massa. Sed at arcu et augue sollicitudin mollis. Nulla gravida, elit id suscipit semper, enim lectus mattis eros, eget tincidunt nulla mauris a erat. Phasellus in mollis ex, ac ultrices lectus. Nunc sed turpis non justo euismod facilisis. Suspendisse interdum mattis nisl ut viverra. Sed placerat diam augue, eget lacinia odio tincidunt sit amet. Nulla dignissim aliquam volutpat. Fusce in arcu placerat, finibus est sed, semper dui. Fusce vitae diam eros.

Cras a posuere dolor, sit amet dignissim nibh. Ut vel vestibulum nisi. Donec ullamcorper, lacus nec congue volutpat, elit nulla varius nibh, vel accumsan risus leo nec nisl. Quisque mi enim, imperdiet sit amet bibendum id, ornare nec elit. Donec maximus faucibus erat ut congue. Proin ut nisl dignissim, vestibulum arcu porttitor, pulvinar dui. Etiam ut ligula diam. Duis eget aliquam diam. Proin et eros sed nulla aliquet posuere. Curabitur eros massa, vehicula eu velit et, facilisis efficitur nisi. Aenean at fermentum sem. Pellentesque maximus lorem vitae ultricies commodo. Duis consectetur dolor et tortor tincidunt interdum. Vestibulum ullamcorper rutrum mi, ornare porttitor elit tempor sed. Donec quis ornare lorem. </p>
<canvas class="webgl"></canvas>
          </div>
              `;
        }
    }
    async attachEvents(){
        console.log('Events attached (Home)');
        const text = document.getElementById("test-text");
        const originalText = text.textContent;

        text.innerHTML = originalText.split("").map(char => `<span>${char}</span>`).join("");

        text.addEventListener("mouseover", ()=> {
          text.querySelectorAll("span").forEach(letter => {
            const randomX = (Math.random() - 0.5) * 600;
            const randomY = (Math.random() - 0.5) * 600;
            letter.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${(Math.random() - 0.5) * 30}deg)`;
          });
        });

        text.addEventListener("mouseleave", () => {
                text.querySelectorAll("span").forEach(letter => {
                    letter.style.transform = "translate(0,0) rotate(0)";
                });
            });

             //event listener pour detecter mouse moves
            const cursor = {x: 0, y: 0};
            window.addEventListener("mousemove", (event) => {
                cursor.x = event.clientX / window.innerWidth - 0.5;
                cursor.y = event.clientY / window.innerHeight - 0.5;
            });

            // Canvas pour le rendu 3D + creation objet box mesh attributs etc
            const canvas = document.querySelector('canvas.webgl');
            const scene = new THREE.Scene();

            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(2, 2, 2);
            scene.add(light);
            const mesh = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1, 5, 5, 5),
                new THREE.MeshLambertMaterial({ color: 0x000000 })
            );
            const sizes = {
                width: window.innerWidth,
                height: window.innerHeight,
            }
            scene.add(mesh);


            // set le renderer de la scene 3d
            const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true } );
            renderer.setSize(sizes.width, sizes.height);
            renderer.setPixelRatio(window.devicePixelRatio);
            // ascii effect a appliquer sur le mesh
            const asciiChar = " :%~";
            const effect = new AsciiEffect(renderer, asciiChar, {
              invert: false,
              resolution: 0.2,
              scale: 1,
          });
          effect.setSize(sizes.width, sizes.height);
          effect.domElement.style.color = "black";
          effect.domElement.style.backgroundColor = "none";

          // on cache le rendu de base pour laisser apparaitre le rendu ascii
          effect.domElement.classList.add("ascii-effect");
          document.body.appendChild(effect.domElement);
          canvas.style.display = "none";

           // camera perspective etc
           const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
           camera.position.z = 3;
           camera.lookAt(mesh.position);
            scene.add(camera);

            // controls for the camera
           const controls = new OrbitControls(camera, effect.domElement);
           controls.enableDamping = true;
           controls.enableZoom = false;

          const clock = new THREE.Clock();
            const tick = () => {
                const elapsedTime = clock.getElapsedTime();
                mesh.rotation.y = elapsedTime * 0.5;

                controls.update();
                effect.render(scene, camera);
                requestAnimationFrame(tick);

            }
            tick();
            // on resize le canvas en fonction de la taille de la fenetre pour + responsive
            window.addEventListener("resize", () => {
              sizes.width = window.innerWidth;
              sizes.height = window.innerHeight;

              camera.aspect = sizes.width / sizes.height;
              camera.updateProjectionMatrix();

              renderer.setSize(sizes.width, sizes.height);
              effect.setSize(sizes.width, sizes.height);
            });
          };



};

