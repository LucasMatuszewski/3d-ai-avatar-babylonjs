import { loadAvatarContainer } from '../src/loadAssets';
import { Engine } from '@babylonjs/core';

describe('loadAvatarContainer', () => {
  let engine;
  let canvas;
  let scene;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    engine = new Engine(canvas, true);
    scene = new BABYLON.Scene(engine);
  });

  afterEach(() => {
    engine.dispose();
  });

  it('should load avatar container and add all assets to the scene', async () => {
    const avatarFile = 'path/to/avatar.glb';
    const avatarContainer = await loadAvatarContainer(avatarFile, scene);

    expect(avatarContainer).toBeDefined();
    expect(avatarContainer.meshes.length).toBeGreaterThan(0);
    expect(scene.meshes.length).toBeGreaterThan(0);
  });

  it('should scale the avatar root mesh correctly', async () => {
    const avatarFile = 'path/to/avatar.glb';
    const avatarContainer = await loadAvatarContainer(avatarFile, scene);
    const avatarRoot = avatarContainer.meshes[0];

    expect(avatarRoot.scaling.x).toBe(2);
    expect(avatarRoot.scaling.y).toBe(2);
    expect(avatarRoot.scaling.z).toBe(2);
  });

  it('should set the avatar root mesh rotation correctly', async () => {
    const avatarFile = 'path/to/avatar.glb';
    const avatarContainer = await loadAvatarContainer(avatarFile, scene);
    const avatarRoot = avatarContainer.meshes[0];

    expect(avatarRoot.rotation.x).toBe(0);
    expect(avatarRoot.rotation.y).toBe(3.6);
    expect(avatarRoot.rotation.z).toBe(0);
  });
});
