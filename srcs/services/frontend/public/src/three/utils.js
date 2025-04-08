

export function cleanUpThree() {
	if (!window.threeInstance) return;
	if (window.threeInstance.animationId) {
		cancelAnimationFrame(window.threeInstance.animationId);
	}
	if (window.threeInstance.resizeHandler) {
		window.removeEventListener("resize", window.threeInstance.resizeHandler);
	}
	if (window.threeInstance.mouseMoveHandler) {
		window.removeEventListener("mousemove", window.threeInstance.mouseMoveHandler);
	}
	if (window.threeInstance.keyDownHandler) {
		window.removeEventListener("keydown", window.threeInstance.keyDownHandler);
	}
	if (window.threeInstance.keyUpHandler) {
		window.removeEventListener("keyup", window.threeInstance.keyUpHandler);
	}

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
	if (window.threeInstance.controls) {
		window.threeInstance.controls.dispose();
	}
	if (window.threeInstance.camera) {
		window.threeInstance.camera.remove();
	}
	if (window.threeInstance.scene) {
		window.threeInstance.scene = null;
	}
	if (window.threeInstance.renderer) {
		window.threeInstance.renderer = null;
	}
	if (window.threeInstance) {
		window.threeInstance = null;
	}
	}


	export function cleanUpThreeTournament() {
		if (!window.threeInstance) return;
		if (window.threeInstance.animationId) {
			cancelAnimationFrame(window.threeInstance.animationId);
		}
		if (window.threeInstance.resizeHandler) {
			window.removeEventListener("resize", window.threeInstance.resizeHandler);
		}
		if (window.threeInstance.mouseMoveHandler) {
			window.removeEventListener("mousemove", window.threeInstance.mouseMoveHandler);
		}
		if (window.threeInstance.keyDownHandler) {
			window.removeEventListener("keydown", window.threeInstance.keyDownHandler);
		}
		if (window.threeInstance.keyUpHandler) {
			window.removeEventListener("keyup", window.threeInstance.keyUpHandler);
		}

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
		if (window.threeInstance.controls) {
			window.threeInstance.controls.dispose();
		}
		if (window.threeInstance.camera) {
			window.threeInstance.camera.remove();
		}
		if (window.threeInstance.scene) {
			window.threeInstance.scene = null;
		}
		if (window.threeInstance.renderer) {
			window.threeInstance.renderer = null;
		}
		if (window.threeInstance) {
			window.threeInstance = null;
		}
}

