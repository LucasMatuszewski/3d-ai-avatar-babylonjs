import { setupGUI } from '../src/gui';
import { Engine } from '@babylonjs/core';

describe('setupGUI', () => {
  let engine;
  let canvas;
  let scene;
  let avatarContainer;
  let a2fData;
  let audioFile;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    engine = new Engine(canvas, true);
    scene = new BABYLON.Scene(engine);
    avatarContainer = {}; // Mock avatar container
    a2fData = {}; // Mock Audio2Face data
    audioFile = 'path/to/audio.wav';
  });

  afterEach(() => {
    engine.dispose();
  });

  it('should set up GUI and create morph target sliders', () => {
    setupGUI(scene, avatarContainer, a2fData, audioFile);

    const advancedTextureUI = scene.getTextureByName('UI');
    expect(advancedTextureUI).toBeDefined();

    const morphTargetSliders = advancedTextureUI.getChildren().filter(child => child.name === 'MorphTargetSlider');
    expect(morphTargetSliders.length).toBeGreaterThan(0);
  });

  it('should create play/pause button and handle click events', () => {
    setupGUI(scene, avatarContainer, a2fData, audioFile);

    const advancedTextureUI = scene.getTextureByName('UI');
    const playPauseButton = advancedTextureUI.getControlByName('playPauseButton');
    expect(playPauseButton).toBeDefined();

    playPauseButton.onPointerUpObservable.notifyObservers();
    expect(playPauseButton.textBlock.text).toBe('Stop');

    playPauseButton.onPointerUpObservable.notifyObservers();
    expect(playPauseButton.textBlock.text).toBe('Play');
  });

  it('should update animation state and apply blend shapes and joint transforms', () => {
    setupGUI(scene, avatarContainer, a2fData, audioFile);

    const animationState = {
      isPlaying: true,
      currentFrame: 0,
      totalFrames: a2fData.weightMat.length,
      audioReady: null,
      audioStartTime: null,
      animationStartTime: null,
      audioStopTime: null,
      animationStopTime: null,
    };

    const precomputedBlendShapes = []; // Mock precomputed blend shapes
    const preselectedJoints = []; // Mock preselected joints

    const animate = () => {
      if (animationState.isPlaying) {
        applyPrecomputedBlendShapes(precomputedBlendShapes, animationState.currentFrame);
        applyJointTransforms(animationState.currentFrame, a2fData.rotations, a2fData.translations, preselectedJoints);
        animationState.currentFrame++;
        if (animationState.currentFrame >= animationState.totalFrames) {
          animationState.isPlaying = false;
        }
      }
    };

    scene.registerBeforeRender(animate);
    scene.render();

    expect(animationState.currentFrame).toBe(1);
    expect(animationState.isPlaying).toBe(true);
  });
});
