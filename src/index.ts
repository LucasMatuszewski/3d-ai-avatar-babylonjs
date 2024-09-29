import {
  Scene,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  loadAssetContainerAsync,
  ArcRotateCamera,
  EngineFactory,
  SpotLight,
  PointLight,
  Color3,
  ShadowGenerator,
  AnimationPropertiesOverride,
  Engine,
} from '@babylonjs/core';
import { Sound } from '@babylonjs/core/Audio/sound';

import type {
  AbstractEngine,
  AssetContainer,
  MorphTarget,
  Node,
  Nullable,
  TransformNode,
} from '@babylonjs/core';

import '@babylonjs/loaders/glTF/2.0';
import '@babylonjs/core/Helpers/sceneHelpers';
import { createMorphTargetSliderGUI } from './helpers';
import { AdvancedDynamicTexture, Button, Control } from '@babylonjs/gui';
import { applyBlendShapes, applyJointTransforms } from './audio2face';
import type { Audio2FaceExportData } from './audio2face';
import a2fData from './assets/a2f/a2f_export_bsweight-Adam-from-Edukey-11L-Charlie.json';

// Parcel 2.0 require URL constructor for unsupported file types, instead of normal import
const avatarFile = new URL(
  // '../../../../3D Models/Michael9/Michael9-packed-resources-Blender4-BSDF-shader-WebP.glb',
  'assets/avaturn-Lucas-blendshapes-idle-animation.glb',
  import.meta.url
).href;

const audioFile = new URL(
  'assets/a2f/EN-11Labs-Adam-from-Edukey-Charlie.wav',
  import.meta.url
).href.split('?')[0]; // Parcel 2.0 adds ?2342342 version id to the file path, it causes error in Babylonjs

/**
 * TODO:
 * - optimize glb file - remove shoos, trousers, maybe remove legs or simplify mesh for legs?
 * - add more details for the face - normal maps, HD texture? (only for face!)
 *   - maybe I need to use Michael original skin for better quality textures? Maybe Michael HD? (no textures are the same, HD only has more dense mesh)
 * - find better hair (smaller! these are 209 000 vertices...) and Eyebrows (40k vertices...)
 * - add baked idle animation (sequence of animations) for body and face
 * - add baked ARKit blendshapes as target morphs and use them in Babylon
 * - add better lights and white background similar to Unreal Engine scene?
 * - add lip sync - connect with Nvidia ACE Audio2Face? Or maybe use simpler model to get visemes from text/audio?
 * - add animations to load from separate files but targeted to the same mesh (how to do this?)
 * - create a custom loading spinner on engine.displayLoadingUI() - how?
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
  // scene.shadowsEnabled = true; // true by default

  /**
   * LIGHTS
   */

  // Create a basic light, aiming 0, 1, 0 - meaning, to the sky
  const ambientLight = new HemisphericLight(
    'light1',
    new Vector3(0, 1, 0),
    scene
  );
  ambientLight.intensity = 0.1;
  ambientLight.specular = Color3.Black();

  // light going only in one direction in a cone defined by angle
  const spotLight = new SpotLight(
    'spotLight',
    new Vector3(0.5, 3, -2),
    // new Vector3(0, 10, 0),
    new Vector3(1, 0.25, 26.5),
    Math.PI / 3, // angle of the light cone
    1,
    scene
  );
  spotLight.intensity = 30;
  // spotLight.shadowEnabled = true; // it doesn't seem to change anything - is shadow enabled by default?
  spotLight.diffuse = new Color3(1, 0.7, 0.7); // warm light

  // light going in all directions from one point
  const pointLight = new PointLight(
    'pointLight',
    new Vector3(-2.5, 3, -2),
    scene
  );
  pointLight.intensity = 10;
  // pointLight.shadowEnabled = true;
  pointLight.diffuse = new Color3(0.9, 1, 0.9);

  // Shadows
  var shadowGenerator = new ShadowGenerator(1024, pointLight);
  shadowGenerator.useBlurExponentialShadowMap = true;
  shadowGenerator.blurKernel = 32;

  /**
   * LOAD OBJECTS TO THE SCENE
   */

  // Create a built-in "ground" shape; its constructor takes 6 params : name, width, height, subdivision, scene, updatable
  // const ground = BABYLON.Mesh.CreateGround('ground1', 6, 6, 2, scene, false); // DEPRECATED
  const ground = MeshBuilder.CreateGround(
    'ground1',
    { width: 6, height: 6, subdivisions: 2, updatable: false },
    scene
  );
  // const grayMaterial = new StandardMaterial('standard', scene);
  // grayMaterial.diffuseColor = Color3.Gray(); // Why Gray is always white? new Color3(0.6, 0.6, 0.6) also doesn't work - why?
  // grayMaterial.roughness = 0;
  // ground.material = grayMaterial;
  ground.receiveShadows = true; // false by default

  /**
   * LOAD AVATAR CONTAINER
   */

  // Import Meshes to the Scene Async: https://doc.babylonjs.com/features/featuresDeepDive/importers/loadingFileTypes#example-pg--WGZLGJ-10491
  const avatarContainer = await loadAssetContainerAsync(avatarFile, scene);
  const avatarContainerCopy = { ...avatarContainer }; // shallow copy without nested objects
  // const avatarContainerCopy = JSON.parse(JSON.stringify(avatarContainer)); // deep copy won't work - circular structure of objects
  console.log('avatarContainer', avatarContainerCopy);
  avatarContainer.addAllToScene(); // add all assets (meshes, animations, materials, textures, etc.) loaded from the file

  const avatarRoot = avatarContainer.meshes[0];
  // make mesh 2x bigger
  avatarRoot.scaling.setAll(2); // shortcut instead of using new Vector3(2, 2, 2) for each dimension
  // avatarRoot.showBoundingBox = true;
  // avatarRoot.renderOutline = true;

  // avatarRoot.position = new Vector3(0, 0.5, 0);
  // avatarRoot.rotationQuaternion = new Quaternion(0, 0, 0, 1);
  avatarRoot.rotationQuaternion = null;
  avatarRoot.rotation = new Vector3(0, 3.6, 0);

  // shadowGenerator.addShadowCaster(scene.meshes[2], true); // mesh 0 = ground, mesh 1 = sphere, mesh 2 = root of Genesis9
  shadowGenerator.addShadowCaster(avatarRoot, true);
  for (var index = 0; index < avatarContainer.meshes.length; index++) {
    avatarContainer.meshes[index].receiveShadows = false;
  }

  /**
   *
   * Morph Targets Manager
   *
   */

  const advancedTextureUI = AdvancedDynamicTexture.CreateFullscreenUI('UI');
  createMorphTargetSliderGUI(avatarContainer, scene, advancedTextureUI);

  /**
   * ANIMATIONS
   */

  scene.animationPropertiesOverride = new AnimationPropertiesOverride(); // we can do the same for player if we use player animations instead of scene animations
  scene.animationPropertiesOverride.enableBlending = true;
  scene.animationPropertiesOverride.blendingSpeed = 0.01; // very slow to make it visible
  scene.animationPropertiesOverride.loopMode = 1;

  // Enable blending for the idle animation group
  // const idleAnimationGroup = avatarContainer.animationGroups[0];
  // idleAnimationGroup.enableBlending = true;
  // idleAnimationGroup.blendingSpeed = 0.01; // very slow to make it visible
  // idleAnimationGroup.play(true);

  // TODO: Parcel fetch and parse json file automatically, but with Webpack we need to do it manually
  const typedA2fData = a2fData as Audio2FaceExportData;

  // Create animation state
  interface AnimationState {
    isPlaying: boolean;
    currentFrame: number;
    totalFrames: number;
    audioReady: number | null;
    audioStartTime: number | null;
    animationStartTime: number | null;
    audioStopTime: number | null;
    animationStopTime: number | null;
  }
  const animationState: AnimationState = {
    isPlaying: false,
    currentFrame: 0,
    totalFrames: typedA2fData.weightMat.length,
    audioReady: null,
    audioStartTime: null,
    animationStartTime: null,
    audioStopTime: null,
    animationStopTime: null,
  };

  const audio = new Sound(
    'Speech',
    audioFile,
    scene,
    () => {
      // readyToPlayCallback ensures audio is loaded and ready
      // audio.currentTime is 0 when audio is ready AND when it ended, we can't use it for this.
      animationState.audioReady = performance.now() / 1000;
      console.log('Audio is ready time (s):', animationState.audioReady);
    },
    {
      autoplay: false,
      loop: false,
      // spatialSound: true,
      volume: 1.0,
    }
  );

  // Listen for the audio stop event and log the stop time
  audio.onEndedObservable.add(() => {
    animationState.audioStopTime = performance.now() / 1000;
    console.log('Audio stop time (s):', animationState.audioStopTime);

    // Reset play state after audio ends
    // animationState.isPlaying = false;

    if (animationState.audioStartTime !== null) {
      console.log(
        'Audio duration (s):',
        animationState.audioStopTime - animationState.audioStartTime
      );
    }
  });

  // Create GUI
  const button = Button.CreateSimpleButton('playPauseButton', 'Play');
  button.width = '150px';
  button.height = '40px';
  button.color = 'white';
  button.cornerRadius = 20;
  button.background = 'green';
  button.top = '-10px';
  button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
  button.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;

  const playAnimation = () => {
    animationState.isPlaying = true;
    animationState.currentFrame = 0;

    if (Engine.audioEngine?.audioContext?.state === 'suspended') {
      Engine.audioEngine.audioContext.resume();
    }
    audio.play();
    // Log the exact start time of audio
    animationState.audioStartTime = performance.now() / 1000;
    console.log('Audio start time (s): ', animationState.audioStartTime);
    button.textBlock!.text = 'Stop';
  };

  const stopAnimation = () => {
    animationState.isPlaying = false;
    animationState.currentFrame = 0;
    audio.stop();
    button.textBlock!.text = 'Play';
  };

  button.onPointerUpObservable.add(() => {
    if (animationState.isPlaying) {
      stopAnimation();
    } else if (animationState.audioReady !== null) {
      playAnimation();
    } else {
      console.log('Audio is not ready');
    }
  });
  advancedTextureUI.addControl(button);

  // Animation function
  const animate = () => {
    if (animationState.isPlaying) {
      applyBlendShapes(
        animationState.currentFrame,
        typedA2fData,
        avatarContainer
      );
      applyJointTransforms(
        animationState.currentFrame,
        typedA2fData,
        avatarRoot // TODO: check if it works, if skeleton is in the root
      );
      if (animationState.currentFrame === 0) {
        // TODO: is it a correct place to log this?
        animationState.animationStartTime = performance.now() / 1000;
        console.log(
          'Blendshape application started at (s):',
          animationState.animationStartTime
        );
      }
      animationState.currentFrame++;
      // We can use modulo to loop: animationState.currentFrame = (animationState.currentFrame + 1) % animationState.totalFrames;

      if (animationState.currentFrame >= animationState.totalFrames) {
        stopAnimation();
        animationState.animationStopTime = performance.now() / 1000;
        console.log(
          'Blendshape application ended at (s):',
          animationState.animationStopTime
        );
        if (animationState.animationStartTime) {
          console.log(
            'Blendshape application took (s):',
            animationState.animationStopTime - animationState.animationStartTime
          );
        }
      }
    }
  };

  // Add animate function to the render loop
  scene.registerBeforeRender(animate);

  /**
   * CAMERAS
   */

  // Create an UniversalCamera (best for First Person games), and set its position to {x: 0, y: 5, z: -10}
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
  camera.minZ = 0.2; // how close we can zoom to the mesh before we see through it (default is 1)
  // camera.lowerRadiusLimit = 0.5; // how close we can zoom to the target (default is without limits = we can get on opposite side of the target)
  // camera.upperRadiusLimit = 10; // how far away we can zoom out of the target
  // camera.radius = 1; // "zoom" of the camera

  // Target the camera to scene origin
  // camera.setTarget(Vector3.Zero());
  // camera.setTarget(avatarRoot);

  // Attach the camera to the canvas
  // camera.attachControl(canvas, false); // two arguments not required anymore (backward compatibility)
  camera.attachControl();

  // Hide the Loading Spinner and show the scene:
  engine.hideLoadingUI();

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

  // Show loading spinner (we have to hide it manually with `engine.hideLoadingUI();` when scene will be loaded)
  engine.displayLoadingUI();

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

  document.addEventListener('click', () => {
    if (Engine.audioEngine && !Engine.audioEngine.unlocked) {
      Engine.audioEngine?.unlock();
    }
  });

  // run the render loop
  engine.runRenderLoop(() => {
    scene.render();
  });
};

init();
