import { MyHmrReloader } from "./hmr";

// document.addEventListener("deviceready", onDeviceReady, false);
document.addEventListener("DOMContentLoaded", onDeviceReady, false);

const myHmrReloader = new MyHmrReloader();

async function onDeviceReady() {
	const { createScene} = await import("./scenes/skull");
	const canvas = document.createElement("canvas");
	canvas.id = "canvas";
	document.body.appendChild(canvas);
	const context = canvas.getContext("webgl");

	const engine = new BABYLON.Engine(context, true, {
		preserveDrawingBuffer: true,
		stencil: true
	});
	const scene = await createScene(engine, canvas);

	myHmrReloader.addCallback(() => {
		scene.dispose();
		engine.dispose();
		canvas.remove();
		myHmrReloader.clearCallbacks();
		onDeviceReady();
	});

	engine.runRenderLoop(function () {
		if (scene) {
			scene.render();
		}
	});
}

