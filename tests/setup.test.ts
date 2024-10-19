import { setupScene } from '../src/setup';
import { Engine } from '@babylonjs/core';

describe('setupScene', () => {
  let engine;
  let canvas;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    engine = new Engine(canvas, true);
  });

  afterEach(() => {
    engine.dispose();
  });

  it('should create a scene with lights, camera, and shadow generator', () => {
    const scene = setupScene(engine, canvas);

    expect(scene.lights.length).toBe(3);
    expect(scene.cameras.length).toBe(1);
    expect(scene.lights[2].getShadowGenerator()).toBeDefined();
  });

  it('should set up ambient light correctly', () => {
    const scene = setupScene(engine, canvas);
    const ambientLight = scene.lights.find(light => light.name === 'light1');

    expect(ambientLight).toBeDefined();
    expect(ambientLight.intensity).toBe(0.1);
    expect(ambientLight.specular.equals(new BABYLON.Color3(0, 0, 0))).toBe(true);
  });

  it('should set up spot light correctly', () => {
    const scene = setupScene(engine, canvas);
    const spotLight = scene.lights.find(light => light.name === 'spotLight');

    expect(spotLight).toBeDefined();
    expect(spotLight.intensity).toBe(30);
    expect(spotLight.diffuse.equals(new BABYLON.Color3(1, 0.7, 0.7))).toBe(true);
  });

  it('should set up point light correctly', () => {
    const scene = setupScene(engine, canvas);
    const pointLight = scene.lights.find(light => light.name === 'pointLight');

    expect(pointLight).toBeDefined();
    expect(pointLight.intensity).toBe(10);
    expect(pointLight.diffuse.equals(new BABYLON.Color3(0.9, 1, 0.9))).toBe(true);
  });

  it('should set up camera correctly', () => {
    const scene = setupScene(engine, canvas);
    const camera = scene.cameras[0];

    expect(camera).toBeDefined();
    expect(camera.name).toBe('camera1');
    expect(camera.alpha).toBe(11);
    expect(camera.beta).toBe(1.4);
    expect(camera.radius).toBe(1.5);
    expect(camera.target.equals(new BABYLON.Vector3(0, 3.15, 0))).toBe(true);
  });

  it('should set up animation properties override correctly', () => {
    const scene = setupScene(engine, canvas);

    expect(scene.animationPropertiesOverride).toBeDefined();
    expect(scene.animationPropertiesOverride.enableBlending).toBe(true);
    expect(scene.animationPropertiesOverride.blendingSpeed).toBe(0.01);
    expect(scene.animationPropertiesOverride.loopMode).toBe(1);
  });
});
