import {
  Engine,
  Scene,
  FreeCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  Mesh,
  Color4,
} from 'babylonjs';

// Get the canvas DOM element
const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
// Load the 3D engine
const engine = new Engine(canvas, true, {
  preserveDrawingBuffer: true,
  stencil: true,
});

// CreateScene function that creates and return the scene
const createScene = function () {
  // Create a basic BJS Scene object
  const scene = new Scene(engine);

  // Create a FreeCamera, and set its position to {x: 0, y: 5, z: -10}
  const camera = new FreeCamera('camera1', new Vector3(0, 5, -10), scene);
  // Target the camera to scene origin
  camera.setTarget(Vector3.Zero());
  // Attach the camera to the canvas
  // camera.attachControl(canvas, false); // two arguments not required any more (backward compatibility)
  camera.attachControl();

  // Create a basic light, aiming 0, 1, 0 - meaning, to the sky
  const light = new HemisphericLight('light1', new Vector3(0, 1, 0), scene);

  // Create a built-in "sphere" shape; its constructor takes 6 params: name, segment, diameter, scene, updatable, sideOrientation
  // DEPRECATED:
  //   const sphere = BABYLON.Mesh.CreateSphere(
  //     'sphere1',
  //     16,
  //     2,
  //     scene,
  //     false,
  //     BABYLON.Mesh.FRONTSIDE
  //   );
  const sphere = MeshBuilder.CreateSphere(
    'sphere1',
    {
      segments: 16,
      diameter: 2,
      updatable: false,
      sideOrientation: Mesh.FRONTSIDE, // default orientation (which side of mesh "face" is visible)
    },
    scene
  );

  // Move the sphere upward 1/2 of its height
  sphere.position.y = 1;

  const box = MeshBuilder.CreateBox(
    'box1',
    {
      size: 1,
      depth: 2,
      updatable: false,
      faceColors: [
        new Color4(0, 0, 1, 1), // Blue
        new Color4(), // Black
        new Color4(1, 0, 0, 1), // Red
      ],
      sideOrientation: Mesh.BACKSIDE, // only internal side of "face" visible, DOUBLESIDE = both sides of "face" visible
    },
    scene
  );

  // Move the box right, upward, and front (closer)
  box.position = new Vector3(2, 1, -2);

  // Create a built-in "ground" shape; its constructor takes 6 params : name, width, height, subdivision, scene, updatable
  // const ground = BABYLON.Mesh.CreateGround('ground1', 6, 6, 2, scene, false); // DEPRECATED
  const ground = MeshBuilder.CreateGround(
    'ground1',
    { width: 6, height: 6, subdivisions: 2, updatable: false },
    scene
  );

  // Return the created scene
  return scene;
};

// call the createScene function
const scene = createScene();
// run the render loop
engine.runRenderLoop(function () {
  scene.render();
});

// the canvas/window resize event handler (to keep same proportions of rendered scene)
window.addEventListener('resize', function () {
  engine.resize();
});
