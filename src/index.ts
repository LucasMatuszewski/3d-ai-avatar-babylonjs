import {
  Scene,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  loadAssetContainerAsync,
  ArcRotateCamera,
  EngineFactory,
} from '@babylonjs/core';

import type { AbstractEngine } from '@babylonjs/core';

import '@babylonjs/loaders/glTF/2.0';
import '@babylonjs/core/Helpers/sceneHelpers';

// import avatarFile from '../../../../3D Models/Michael9/Michael9-packed-resources-Blender4-BSDF-shader-WebP.glb';

// Parcel 2.0 require URL constructor for unsupported file types, instead of normal import
const avatarFile = new URL(
  '../../../../3D Models/Michael9/Michael9-packed-resources-Blender4-BSDF-shader-WebP.glb',
  // 'assets/Victoria9-red-dress-include-visible.glb',
  import.meta.url
).href;

/**
 * TODO:
 * - optimize glb file - remove shoos, trousers, maybe remove legs or simplify mesh for legs?
 * - add more details for the face - normal maps, HD texture? (only for face!)
 *   - maybe I need to use Michael original skin for better quality textures? Maybe Michael HD?
 * - find better hair?
 * - add backed idle animation (sequence of animations) for body and face
 * - add better lights and white background similar to Unreal Engine scene?
 * - add animations to load from separate files but targeted to the same mesh (how to do this?)
 * - add lip sync - how?
 */

// import forest from '../src/assets/forest.env';
// import studioEnv from '../src/assets/Studio_Softbox_2Umbrellas_cube_specular.env';

// CreateScene function that creates and return the scene
const createScene = async (
  engine: AbstractEngine,
  canvas: HTMLCanvasElement
) => {
  // Create a basic BJS Scene object
  const scene = new Scene(engine);

  // Create a basic light, aiming 0, 1, 0 - meaning, to the sky
  const light = new HemisphericLight('light1', new Vector3(0, 1, 0), scene);

  // Import Meshes to the Scene Async: https://doc.babylonjs.com/features/featuresDeepDive/importers/loadingFileTypes#example-pg--WGZLGJ-10491
  const assetContainer = await loadAssetContainerAsync(avatarFile, scene);
  console.log('assetContainer', assetContainer);
  assetContainer.addAllToScene(); // add all assets (meshes, animations, materials, textures, etc.) loaded from the file

  const avatarRoot = assetContainer.meshes[0];
  // make mesh 2x bigger
  // avatarRoot.scaling = new Vector3(2, 2, 2);
  avatarRoot.scaling.setAll(2); // shortcut instead of using Vector for each dimension
  avatarRoot.showBoundingBox = true;
  avatarRoot.renderOutline = true;

  // avatarRoot.position = new Vector3(0, 0.5, 0);
  // avatarRoot.rotation = new Vector3(0, Math.PI, 0);

  // const hairCapMesh = assetContainer.meshes[4];
  // hairCapMesh.isVisible = false;

  // Create a built-in "ground" shape; its constructor takes 6 params : name, width, height, subdivision, scene, updatable
  // const ground = BABYLON.Mesh.CreateGround('ground1', 6, 6, 2, scene, false); // DEPRECATED
  const ground = MeshBuilder.CreateGround(
    'ground1',
    { width: 6, height: 6, subdivisions: 2, updatable: false },
    scene
  );

  // Create a UniversalCamera (best for First Person games), and set its position to {x: 0, y: 5, z: -10}
  // const camera = new UniversalCamera('camera1', new Vector3(0, 5, -10), scene);

  // Create Camera rotating around the targeted point:
  const camera = new ArcRotateCamera(
    'camera1',
    11, // alpha = rotate left and right
    1.4, // beta = rotate up and down
    1.5, // radius = zoom / distance
    new Vector3(0, 3.15, 0), // Target the camera on the avatar's head
    scene
  );
  camera.wheelPrecision = 100; // speed of scrolling (higher = slower)

  // Target the camera to scene origin
  // camera.setTarget(Vector3.Zero());

  // Attach the camera to the canvas
  // camera.attachControl(canvas, false); // two arguments not required anymore (backward compatibility)
  camera.attachControl();

  // Return the created scene
  return scene;
};

const init = async () => {
  // Get the canvas DOM element
  const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;

  // Engine factory use WebGPUEngine.IsSupportedAsync internally to check if WebGPU is supported
  // then it initiates either WebGPUEngine or normal Engine (for WebGL)
  const engine = await EngineFactory.CreateAsync(canvas, {
    antialias: true,
    useExactSrgbConversions: true,
  });
  console.log('engine.isWebGPU', engine.isWebGPU);

  // Load the WebGL engine
  // const engine = new Engine(canvas, true, {
  //   preserveDrawingBuffer: true, // is it deprecated option?
  //   stencil: true, // Stencil buffer texture
  //   powerPreference: 'low-power' | 'high-performance';
  // });

  // call the createScene function
  const scene = await createScene(engine, canvas);

  // the canvas/window resize event handler (to keep same proportions of rendered scene)
  window.addEventListener('resize', () => {
    engine.resize();
  });

  // run the render loop
  engine.runRenderLoop(() => {
    scene.render();
  });
};

init();
