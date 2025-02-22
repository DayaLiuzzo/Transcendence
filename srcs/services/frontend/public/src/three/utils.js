

export function cleanUpThree() {
	if (!window.threeInstance) return;

	console.log("Cleaning up Three.js");

	cancelAnimationFrame(window.threeInstance.animationId);
	window.removeEventListener("resize", window.threeInstance.resizeHandler);
	window.removeEventListener("mousemove", window.threeInstance.mouseMoveHandler);

	// On parcourt tous les objets de la scène pour les supprimer
	window.threeInstance.scene.traverse((object) => {
		if (object.geometry) object.geometry.dispose();
		if (object.material) {
			if (Array.isArray(object.material)) {
				object.material.forEach((mat) => mat.dispose());
			} else {
				object.material.dispose();
			}
		}
		if (object.texture) object.texture.dispose();
	});

	window.threeInstance.renderer.dispose();

	if (window.threeInstance.effect) {
		window.threeInstance.effect.domElement.remove();
		}
		if (window.threeInstance.canvas) {
			window.threeInstance.canvas.remove();
		}
		window.threeInstance = null;
	}

