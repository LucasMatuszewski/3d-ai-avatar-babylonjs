import { setupAnimations, playAnimation, stopAnimation } from '../src/animations';
import { Engine } from '@babylonjs/core';

describe('setupAnimations', () => {
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

  it('should set up animations and return animation state and audio', () => {
    const { animationState, audio } = setupAnimations(scene, avatarContainer, a2fData, audioFile);

    expect(animationState).toBeDefined();
    expect(audio).toBeDefined();
  });

  it('should initialize animation state correctly', () => {
    const { animationState } = setupAnimations(scene, avatarContainer, a2fData, audioFile);

    expect(animationState.isPlaying).toBe(false);
    expect(animationState.currentFrame).toBe(0);
    expect(animationState.totalFrames).toBe(a2fData.weightMat.length);
    expect(animationState.audioReady).toBeNull();
    expect(animationState.audioStartTime).toBeNull();
    expect(animationState.animationStartTime).toBeNull();
    expect(animationState.audioStopTime).toBeNull();
    expect(animationState.animationStopTime).toBeNull();
  });

  it('should play animation and update animation state', () => {
    const { animationState, audio } = setupAnimations(scene, avatarContainer, a2fData, audioFile);
    const button = { textBlock: { text: '' } };

    playAnimation(animationState, audio, button);

    expect(animationState.isPlaying).toBe(true);
    expect(animationState.currentFrame).toBe(0);
    expect(button.textBlock.text).toBe('Stop');
  });

  it('should stop animation and reset animation state', () => {
    const { animationState, audio } = setupAnimations(scene, avatarContainer, a2fData, audioFile);
    const button = { textBlock: { text: '' } };

    playAnimation(animationState, audio, button);
    stopAnimation(animationState, audio, button);

    expect(animationState.isPlaying).toBe(false);
    expect(animationState.currentFrame).toBe(0);
    expect(button.textBlock.text).toBe('Play');
  });
});
