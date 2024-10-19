# 3D AI Avatar Babylon.js SDK

This SDK provides tools to build and animate 3D avatars using Babylon.js. The SDK is modular and allows for easy integration into your projects.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Modules](#modules)
  - [Setup](#setup)
  - [Load Assets](#load-assets)
  - [Animations](#animations)
  - [GUI](#gui)
- [Tests](#tests)

## Installation

To install the SDK, run the following command:

```bash
npm install 3d-ai-avatar-babylonjs
```

## Usage

To use the SDK, import the necessary modules and initialize the scene:

```typescript
import { EngineFactory } from '@babylonjs/core';
import { setupScene } from '3d-ai-avatar-babylonjs/setup';
import { loadAvatarContainer } from '3d-ai-avatar-babylonjs/loadAssets';
import { setupAnimations } from '3d-ai-avatar-babylonjs/animations';
import { setupGUI } from '3d-ai-avatar-babylonjs/gui';
import a2fData from '3d-ai-avatar-babylonjs/assets/a2f/a2f_export_bsweight-Adam-from-Edukey-11L-Charlie.json';

const avatarFile = 'path/to/avatar.glb';
const audioFile = 'path/to/audio.wav';

const createScene = async (engine, canvas) => {
  const scene = setupScene(engine, canvas);
  const avatarContainer = await loadAvatarContainer(avatarFile, scene);
  const { animationState, audio } = setupAnimations(scene, avatarContainer, a2fData, audioFile);
  setupGUI(scene, avatarContainer, a2fData, audioFile);

  engine.hideLoadingUI();
  return scene;
};

const init = async () => {
  const canvas = document.getElementById('renderCanvas');
  const engine = await EngineFactory.CreateAsync(canvas, {
    antialias: true,
    useExactSrgbConversions: true,
  });

  engine.displayLoadingUI();
  const scene = await createScene(engine, canvas);

  window.addEventListener('resize', () => {
    engine.resize();
  });

  document.addEventListener('click', () => {
    if (Engine.audioEngine && !Engine.audioEngine.unlocked) {
      Engine.audioEngine.unlock();
    }
  });

  engine.runRenderLoop(() => {
    scene.render();
  });
};

init();
```

## Modules

### Setup

The `setup` module initializes the Babylon.js scene, lights, and camera.

```typescript
import { setupScene } from '3d-ai-avatar-babylonjs/setup';

const scene = setupScene(engine, canvas);
```

### Load Assets

The `loadAssets` module loads the avatar and adds it to the scene.

```typescript
import { loadAvatarContainer } from '3d-ai-avatar-babylonjs/loadAssets';

const avatarContainer = await loadAvatarContainer(avatarFile, scene);
```

### Animations

The `animations` module sets up and controls the animations for the avatar.

```typescript
import { setupAnimations } from '3d-ai-avatar-babylonjs/animations';

const { animationState, audio } = setupAnimations(scene, avatarContainer, a2fData, audioFile);
```

### GUI

The `gui` module sets up the graphical user interface for controlling the avatar.

```typescript
import { setupGUI } from '3d-ai-avatar-babylonjs/gui';

setupGUI(scene, avatarContainer, a2fData, audioFile);
```

## Tests

Tests for the SDK are located in the `tests` directory. To run the tests, use the following command:

```bash
npm test
```
