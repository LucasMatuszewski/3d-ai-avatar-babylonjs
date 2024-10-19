import {
  Scene,
  Vector3,
  HemisphericLight,
  SpotLight,
  PointLight,
  Color3,
  ShadowGenerator,
  ArcRotateCamera,
  AnimationPropertiesOverride,
} from '@babylonjs/core';

export function setupScene(engine, canvas) {
  // Create a basic BJS Scene object
  const scene = new Scene(engine);

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
   * CAMERAS
   */

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

  /**
   * ANIMATIONS
   */

  scene.animationPropertiesOverride = new AnimationPropertiesOverride(); // we can do the same for player if we use player animations instead of scene animations
  scene.animationPropertiesOverride.enableBlending = true;
  scene.animationPropertiesOverride.blendingSpeed = 0.01; // very slow to make it visible
  scene.animationPropertiesOverride.loopMode = 1;

  return scene;
}
