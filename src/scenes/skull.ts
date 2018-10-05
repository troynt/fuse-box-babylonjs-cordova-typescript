import * as BABYLON from "babylonjs";

export const createScene = async (engine, canvas) => {
    
    const skull = await import("./skull.babylon");
    const [, file] = skull.match(/assets\/(.*skull.babylon)$/)
    
    var scene = new BABYLON.Scene(engine);
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    // var camera = new BABYLON.ArcRotateCamera("Camera", 0, Math.PI / 2, 100, new BABYLON.Vector3(0, 0, 0), scene);

    const dist = -180;
    console.log('dist is ', dist)
    var camera = new BABYLON.VirtualJoysticksCamera("Camera", new BABYLON.Vector3(0, 0, dist), scene);
    camera.checkCollisions = true;

    camera.attachControl(canvas, false);

    engine.enableOfflineSupport = false;

    // Assets manager
    var assetsManager = new BABYLON.AssetsManager(scene);

    var meshTask = assetsManager.addMeshTask("skull task", "", 'assets/', file);

    // You can handle success and error on a per-task basis (onSuccess, onError)
    meshTask.onSuccess = function (task) {
        task.loadedMeshes[0].position = new BABYLON.Vector3(0, 0, 0);
    }

    // But you can also do it on the assets manager itself (onTaskSuccess, onTaskError)
    assetsManager.onTaskError = function (task) {
        console.log("error while loading " + task.name);
    }


    // Can now change loading background color:
    engine.loadingUIBackgroundColor = "Purple";

    // Just call load to initiate the loading sequence
    assetsManager.load();

    return scene;
};