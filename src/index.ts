import { EngineFactory, Engine } from '@babylonjs/core';
import { setupScene } from './setup';
import { loadAvatarContainer } from './loadAssets';
import { setupAnimations, playAnimation, stopAnimation } from './animations';
import { setupGUI } from './gui';
import a2fData from './assets/a2f/a2f_export_bsweight-Adam-from-Edukey-11L-Charlie.json';

// Parcel 2.0 require URL constructor for unsupported file types, instead of normal import
const avatarFile = new URL(
  'assets/avaturn-Lucas-blendshapes-idle-animation.glb',
  import.meta.url
).href;

const audioFile = new URL(
  'assets/a2f/EN-11Labs-Adam-from-Edukey-Charlie.wav',
  import.meta.url
).href.split('?')[0]; // Parcel 2.0 adds ?2342342 version id to the file path, it causes error in Babylonjs

const createScene = async (engine: Engine, canvas: HTMLCanvasElement) => {
  const scene = setupScene(engine, canvas);
  const avatarContainer = await loadAvatarContainer(avatarFile, scene);
  const { animationState, audio } = setupAnimations(scene, avatarContainer, a2fData, audioFile);
  setupGUI(scene, avatarContainer, a2fData, audioFile);

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
