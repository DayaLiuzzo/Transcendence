// gameClass.js
import * as THREE from 'three'; // Assurez-vous que trois.js est correctement installé et accessible

class GameObject {
    constructor(geometry, material, x = 0, y = 0, z = 0) {
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, y, z);
    }

    updatePosition(newX, newY, newZ) {
        this.mesh.position.set(newX, newY, newZ);
    }

    printInfo() {
        const pos = this.mesh.position;
        console.log(`Position: (${pos.x}, ${pos.y}, ${pos.z})`);
    }
}

export { GameObject }

class Ball extends GameObject {
    constructor(radius, color, x, y, z) {
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshStandardMaterial({ color });
        super(geometry, material, x, y, z);
    }
}

export { Ball }

class Light extends GameObject {
    constructor(x, y, z, color = 0xffffff, intensity = 1) {
        const material = new THREE.MeshStandardMaterial({ color }); // Pas de géométrie nécessaire pour la lumière
        super(new THREE.BoxGeometry(1, 1, 1), material, x, y, z); // Utiliser une géométrie de fallback (par exemple, un petit cube)

        this.light = new THREE.DirectionalLight(color, intensity);
        this.light.position.set(x, y, z);
        this.mesh.add(this.light);
    }

    adjustIntensity(newIntensity) {
        this.light.intensity = newIntensity;
    }

    changeColor(newColor) {
        this.light.color.set(newColor);
    }

    printInfo() {
        super.printInfo();
        console.log(`Light color: ${this.light.color.getHexString()}, Intensity: ${this.light.intensity}`);
    }
}

export {Light}

class Camera extends GameObject {
    constructor(x, y, z, fov = 75, near = 0.1, far = 1000) {
        const material = new THREE.MeshStandardMaterial(); // Pas de géométrie nécessaire pour la caméra
        super(new THREE.BoxGeometry(1, 1, 1), material, x, y, z); // Utiliser une géométrie de fallback (par exemple, un petit cube)
        this.camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far);
        this.camera.position.set(x, y, z);
    }

    adjustFov(newFov) {
        this.camera.fov = newFov;
        this.camera.updateProjectionMatrix(); // Mettre à jour la matrice de projection après avoir modifié le FOV
    }

    adjustPlanes(near, far) {
        this.camera.near = near;
        this.camera.far = far;
        this.camera.updateProjectionMatrix(); // Mettre à jour la matrice de projection
    }

    printInfo() {
        super.printInfo();
        console.log(`Camera FOV: ${this.camera.fov}°, Near plane: ${this.camera.near}, Far plane: ${this.camera.far}`);
    }
}

export { Camera }

class Paddle extends GameObject {
    constructor(width, height, depth, color, x, y, z) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshStandardMaterial({ color });
        super(geometry, material, x, y, z);
    }
}

export { Paddle }

class Field {
    constructor(width, height, color) {
        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshStandardMaterial({
            color,
            side: THREE.DoubleSide
        });
        this.mesh = new THREE.Mesh(geometry, material);

        this.mesh.rotation.x = Math.PI / 2;
    }
}

export { Field }
