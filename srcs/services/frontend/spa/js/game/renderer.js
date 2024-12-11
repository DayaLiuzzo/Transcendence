import * as THREE from 'three';

export default class Renderer {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
    }

    animate(updateCallback) {
        const renderScene = () => {
            requestAnimationFrame(renderScene);
            if (updateCallback) updateCallback();
            this.renderer.render(this.scene, this.camera);
        };
        renderScene();
    }
}
