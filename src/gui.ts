import { AdvancedDynamicTexture, Button, Control } from '@babylonjs/gui';
import { applyJointTransforms, applyPrecomputedBlendShapes } from './audio2face';
import { createMorphTargetSliderGUI } from './helpers';
import type { Audio2FaceExportData } from './audio2face';
import { Engine } from '@babylonjs/core';

export function setupGUI(scene, avatarContainer, a2fData, audioFile) {
  const advancedTextureUI = AdvancedDynamicTexture.CreateFullscreenUI('UI');
  createMorphTargetSliderGUI(avatarContainer, scene, advancedTextureUI);

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
    totalFrames: a2fData.weightMat.length,
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

    // Apply the first frame's morph targets and joints to make sure we start animation faster then audio
    applyPrecomputedBlendShapes(
      precomputedBlendShapes,
      animationState.currentFrame
    );
    applyJointTransforms(
      animationState.currentFrame,
      a2fData.rotations,
      a2fData.translations,
      preselectedJoints
    );

    // Render the scene to ensure the first frame is displayed (and shaders compiled)
    scene.render();

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
      applyPrecomputedBlendShapes(
        precomputedBlendShapes,
        animationState.currentFrame
      );
      // applyBlendShapes(
      //   animationState.currentFrame,
      //   a2fData.weightMat,
      //   a2fData.facsNames,
      //   avatarContainer
      // );
      applyJointTransforms(
        animationState.currentFrame,
        a2fData.rotations,
        a2fData.translations,
        preselectedJoints
      );
      if (animationState.currentFrame === 0) {
        animationState.animationStartTime = performance.now() / 1000;
        console.log(
          'Blendshape application started at (s):',
          animationState.animationStartTime
        );

        // Start audio.play() after animation starts because it takes more time to load blendshapes then to load audio
        audio.play();
        // Log the exact start time of audio
        animationState.audioStartTime = performance.now() / 1000;
        console.log('Audio start time (s): ', animationState.audioStartTime);
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
}
