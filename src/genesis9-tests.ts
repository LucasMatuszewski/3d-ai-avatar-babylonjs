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
  PBRMaterial,
  Color3,
  ShadowGenerator,
  StandardMaterial,
  AnimationPropertiesOverride,
} from '@babylonjs/core';

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

// import avatarFile from '../../../../3D Models/Michael9/Michael9-packed-resources-Blender4-BSDF-shader-WebP.glb';

// Parcel 2.0 require URL constructor for unsupported file types, instead of normal import
const avatarFile = new URL(
  // 'assets/Victoria9-red-dress-include-visible.glb',
  // '../../../../3D Models/Michael9/Michael9-packed-resources-Blender4-BSDF-shader-WebP.glb',
  // '../../../../3D Models/Michael9/Michael9-v3-JPG-all-face-textures-BSDF-shader.glb',
  // '../../../../3D Models/Michael9/Michael9-v3-WebP-all-face-textures-BSDF-shader.glb', // WebP
  // '../../../../3D Models/Michael9/Michael9-v3-WebP+DRACO6-all-face-textures-BSDF-shader.glb', // WebP + DRACO
  // '../../../../3D Models/Michael9/Michael9-optimized-with-more-morphs-as-shape-keys-Draco.glb', // with Blend Shapes / shape keys (I had and error with WebP export)
  'assets/avaturn-Lucas-blendshapes-T-pose.glb',
  import.meta.url
).href;

const animationIdle = new URL(
  // '../../../../3D Models/Michael9/Animation-Michael9-from-DAZ-Mixamo-idle.glb',
  // '../../../../3D Models/Animations/Mixamo to Daz Genesis 9/Idle-Breathing-Swing.glb',
  '../../../../3D Models/Animations/Mixamo to Daz Genesis 9/Idle-Breathing-Swing - scale1-applied.glb',
  // '../../../../3D Models/Animations/Mixamo to Daz Genesis 9/Idle-Breathing-Swing - scale1-applied - modifiers applied.glb',
  import.meta.url
).href;

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

  // const env = scene.createDefaultEnvironment({
  //   enableGroundShadow: true,
  // });
  // if (env) {
  //   env.setMainColor(Color3.Gray());
  // }

  // const box = MeshBuilder.CreateBox(
  //   'bigBox',
  //   {
  //     size: 10,
  //     sideOrientation: Mesh.BACKSIDE, // only internal side of "face" visible, DOUBLESIDE = both sides of "face" visible
  //   },
  //   scene
  // );

  // const sphere = MeshBuilder.CreateSphere(
  //   'sphere',
  //   { segments: 16, diameter: 1 },
  //   scene
  // );
  // sphere.position = new Vector3(0.5, 3, -3);

  // const pbr = new PBRMaterial('pbr', scene);
  // pbr.metallic = 0; // Between 0 and 1
  // pbr.roughness = 0; // Between 0 and 1
  // pbr.alpha = 0.3;
  // pbr.subSurface.isRefractionEnabled = true;
  // pbr.subSurface.indexOfRefraction = 1.7;
  // pbr.subSurface.tintColor = Color3.Green();
  // sphere.material = pbr;

  /**
   * LOAD AVATAR MESH
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
  // avatarRoot.rotation = new Vector3(0, Math.PI, 0);

  // shadowGenerator.addShadowCaster(scene.meshes[2], true); // mesh 0 = ground, mesh 1 = sphere, mesh 2 = root of Genesis9
  shadowGenerator.addShadowCaster(avatarRoot, true);
  for (var index = 0; index < avatarContainer.meshes.length; index++) {
    avatarContainer.meshes[index].receiveShadows = false;
  }

  // const hairCapMesh = avatarContainer.meshes[3];
  // hairCapMesh.isVisible = false; // was visible when moving the camera
  // avatarContainer.meshes[4].isVisible = false; // additional eyebrows (secondary) - without a difference in view = waste of performance

  /**
   *
   * Morph Targets Manager
   *
   */

  createMorphTargetSliderGUI(avatarContainer, scene);

  // Genesis9 meshes 6-10 for body:
  // 6 -
  // 7 -
  // 8 - head
  // 9 - hands
  // 10 - legs

  // const avatarHeadMesh = avatarContainer.meshes[8];
  // console.log(
  //   'avatarBodyMesh.morphTargetManager',
  //   avatarHeadMesh.morphTargetManager
  // );

  // const avatarHeadAngry =
  //   avatarHeadMesh.morphTargetManager?.getTargetByName('mouthSmile');
  // // avatarHeadMesh.morphTargetManager?.getTargetByName('Smile Full Face');
  // console.log('avatarHeadAngry', avatarHeadAngry);
  // if (avatarHeadAngry) {
  //   avatarHeadAngry.influence = 1;
  // }

  /**
   * ANIMATIONS
   */

  const animationsContainer = await loadAssetContainerAsync(
    animationIdle,
    scene
  );

  const idleAnimationRanges =
    animationsContainer.skeletons[0].getAnimationRanges();
  console.log('idleAnimationRanges', idleAnimationRanges);
  // animationsContainer.meshes[0].rotate(new Vector3(0, 1, 0), Math.PI);
  // animationsContainer.meshes[0].scaling.setAll(2);

  // animationsContainer.addAllToScene();
  const animationsContainerCopy = { ...animationsContainer }; // shallow copy without nested objects
  console.log('animationsContainer', animationsContainerCopy);

  /**
   *
   * Merge Animations to scene with re-targeting (target changed to avatar)
   *
   */

  // Clone animation tables to the scene
  // function copied from original BabylonJS AssetContainer.mergeAnimationsTo() + added support for Mixamo name added
  const targetConverter: Nullable<(target: any) => Nullable<Node>> = (
    target
  ) => {
    // omit mesh and bone transformations:
    // if (target?.getClassName() !== 'TransformNode') return null;

    // if (target?.name !== 'hip') return null;

    // console.log('target._isMesh', target._isMesh);
    // console.log('target.getClassName()', target.getClassName());

    // console.log('targetConverter target', target);
    let node: Nullable<TransformNode | MorphTarget | Node> = null;
    const targetProperty = target.animations.length
      ? target.animations[0].targetProperty
      : '';
    /*
            BabylonJS adds special naming to targets that are children of nodes.
            This name attempts to remove that special naming to get the parent nodes name in case the target
            can't be found in the node tree

            Ex: Torso_primitive0 likely points to a Mesh primitive. We take away primitive0 and are left with "Torso" which is the name
            of the primitive's parent.
        */
    const name = target.name
      .split('.')
      .join('')
      .split('_primitive')[0]
      .replace('MixamoRigged', '');
    // example names from Avatar Mesh: Genesis9.Shape_primitive0, Genesis9.Shape_primitive3
    // example names from Avatar TransformNode:  Genesis9.Shape, Genesis9
    // example names from Mixamo animations: "MixamoRiggedGenesis9.Shape_primitive0", "MixamoRiggedGenesis9.Shape"
    switch (targetProperty) {
      case 'position':
      case 'rotationQuaternion':
        // case 'scaling':
        node =
          scene.getTransformNodeByName(target.name) ||
          scene.getTransformNodeByName(name);
        break;
      case 'influence':
        // console.log('influence node', node);
        node =
          scene.getMorphTargetByName(target.name) ||
          scene.getMorphTargetByName(name);
        break;
      default:
        // node = null;
        node = scene.getNodeByName(target.name) || scene.getNodeByName(name);
      // console.log('target.getClassName()', target.getClassName());
      // console.log('target.animations', target.animations);
      // console.log('default node', node);
    }

    // TODO: should I omit some types of nodes? How to stop mesh deformation?
    const className = node?.getClassName(); // e.g. Mesh, Bone, TransformNode
    // console.log('node?.getClassName()', className);
    // console.log('className != TransformNode', className != 'TransformNode');
    // console.log('targetConverter node', node);
    // if (className == 'TransformNode') {
    //   return node as Nullable<Node>;
    // } else {
    //   return null;
    // }

    return node as Nullable<Node>;
  };

  // const idleAnim = animationsContainer.animationGroups[0];
  // const avatarIdleAnimationGroup = animationsContainer.mergeAnimationsTo(
  //   scene,
  //   idleAnim.animatables,
  //   targetConverter
  // );
  // // console.log('avatarIdleAnimationGroup', avatarIdleAnimationGroup);
  // avatarIdleAnimationGroup[0].start(true); // starting animation make the mesh less deformed (but still it looks more like a skeleton than the mesh, but at least bones are in correct places)
  // scene.beginAnimation(avatarRoot, idleAnim.from, idleAnim.to, true);

  /**
   *
   * OTHER TESTS of animation transformations
   *
   **/

  // Scale the animation keyframes before merging them to the avatar model
  // const scaleFactor = 2; // Adjust this value as needed
  // idleAnim.targetedAnimations.forEach((targetAnim) => {
  //   if (
  //     targetAnim.animation.targetProperty === 'scaling'
  //     // targetAnim.animation.targetProperty === 'position'
  //   ) {
  //     const keys = targetAnim.animation.getKeys();
  //     keys.forEach((key) => {
  //       key.value = key.value.scale(scaleFactor);
  //     });
  //   }
  // });

  // avatarContainer.skeletons[0].copyAnimationRange(animationsContainer.skeletons[0], range.name);

  // const transformNodesAdded: Node['name'][] = [];

  // for (let i = 0; i < animationsContainer.transformNodes.length; i++) {
  //   animationsContainer.transformNodes[i].scaling = new Vector3(
  //     1,
  //     0.1,
  //     1
  //   ); /* Vector3.One() */
  // }

  /**
   *
   * Clone of AnimationGroup
   * Instead of merging animaTable to scene we can also clone AnimationGroups with cloned animations and re-targeting
   */
  const targetConverterForAnimationGroup = (target: Node) => {
    // console.log('target', target);
    // change target only for hip (for tests)
    // if (target.name !== 'hip') return target;

    // console.log('transformNodesAdded', transformNodesAdded);
    // if (
    //   transformNodesAdded.find((addedNodeName) => addedNodeName === target.name)
    // ) {
    //   return target;
    // }
    // transformNodesAdded.push(target.name);

    // if (target.name === 'hip') {
    //   return avatarContainer.transformNodes.find(
    //     (newTarget) => newTarget.name === 'root'
    //   );
    // }

    // const nodeIndex = avatarContainer.transformNodes.findIndex(
    //   (newTarget) => newTarget.name === target.name
    // );

    // const newTarget =
    //   avatarContainer.transformNodes[nodeIndex + 2] ||
    //   avatarContainer.transformNodes[nodeIndex];
    // return newTarget;

    const newTarget = avatarContainer.transformNodes.find(
      (newTarget) => newTarget.name === target.name
    );
    // console.log('target.getClassName()', target.getClassName());
    // console.log('newTarget.getClassName()', newTarget?.getClassName());

    console.log('target', target);
    console.log('newTarget', newTarget);
    return newTarget;
  };

  // avatarContainer.animationGroups.push(
  //   animationsContainer.animationGroups[0].clone(
  //     'idle',
  //     targetConverterForAnimationGroup,
  //     false
  //   )
  // );

  // avatarContainer.animationGroups[0].start(true);

  // const hipIndex = animationsContainer.transformNodes.findIndex(
  //   (node) => node.name === 'hip'
  // );
  // const avatarGenesis9Index = avatarContainer.transformNodes.findIndex(
  //   (node) => node.name === 'root'
  // );
  // console.log('avatarGenesis9Index', avatarGenesis9Index);
  // const clonedNode = animationsContainer.transformNodes[hipIndex].clone(
  //   'hip',
  //   avatarContainer.transformNodes[avatarGenesis9Index]
  // );
  // console.log('clonedNode', clonedNode);

  scene.animationPropertiesOverride = new AnimationPropertiesOverride(); // we can do the same for player if we use player animations instead of scene animations
  scene.animationPropertiesOverride.enableBlending = true;
  scene.animationPropertiesOverride.blendingSpeed = 0.01; // very slow to make it visible
  scene.animationPropertiesOverride.loopMode = 1;

  // Rotate the mesh by 90* around the X-axes
  // avatarRoot.rotate(new Vector3(1, 0, 0), Math.PI / 2);

  // avatarRoot.scaling.setAll(0.01);

  // animationsContainer.addToScene()
  // const skeleton = animationsContainer.skeletons[0]
  // const idleAnim = skeleton.getAnimationRange("")

  // animationsContainer.geometries = avatarContainer.geometries;
  // animationsContainer.materials = avatarContainer.materials;
  // animationsContainer.meshes = avatarContainer.meshes;
  // animationsContainer.rootNodes = avatarContainer.rootNodes;
  // animationsContainer.skeletons = avatarContainer.skeletons;
  // // animationsContainer.transformNodes = avatarContainer.transformNodes;

  // const idleAnim = animationsContainer.animationGroups[0];
  // const avatarSkeleton = avatarContainer.skeletons[0];
  // const animationsCount = idleAnim.targetedAnimations.length - 1;

  // // Copy transform Nodes from Animation to Avatar
  // animationsContainer.transformNodes.forEach((animationNode, index) => {
  //   index < 5 && console.log('animationNode', { ...animationNode });
  //   const avatarNodeIndex = avatarContainer.transformNodes.findIndex(
  //     (avatarNode) => avatarNode.name === animationNode.name
  //   );
  //   const avatarNode = avatarContainer.transformNodes[avatarNodeIndex];
  //   if (avatarNode && animationNode) {
  //     avatarNode.animations = animationNode.animations;
  //     // animationNode = avatarNode;
  //     avatarContainer.transformNodes[avatarNodeIndex] = animationNode;
  //   }
  // });

  // idleAnim.targetedAnimations.forEach((targetedAnimation, index) => {
  //   index < 5 && console.log('targetedAnimation', { ...targetedAnimation });

  //   // TODO: target skeleton's bones? Or avatarContainer.transformNodes?
  //   // Copy animations from original target to animations array of a new target?
  //   targetedAnimation.target = {
  //     ...avatarSkeleton.bones[
  //       avatarSkeleton.getBoneIndexByName(targetedAnimation.target.name)
  //     ],
  //     animations: targetedAnimation.target.animations,
  //   };
  //   // if (targetedAnimation.target.name === 'Armature') {
  //   //   targetedAnimation.target = scene.getMeshByName('Armature'); // Replace with the actual name of your skeleton
  //   // }

  //   if (index >= animationsCount) {
  //     console.log(
  //       'modified animationsContainer idleAnim',
  //       animationsContainer.animationGroups[0]
  //     );
  //     avatarContainer.animationGroups = animationsContainer.animationGroups;

  //     avatarContainer.addAllToScene(); // add all assets (meshes, animations, materials, textures, etc.) loaded from the file

  //     console.log('modified avatarContainer', avatarContainer);

  //     // animationsContainer.addAllToScene();
  //     scene.beginAnimation(
  //       avatarSkeleton,
  //       avatarContainer.animationGroups[0].from,
  //       avatarContainer.animationGroups[0].to,
  //       true
  //     );
  //     scene.beginAnimation(
  //       avatarRoot,
  //       avatarContainer.animationGroups[0].from,
  //       avatarContainer.animationGroups[0].to,
  //       true
  //     );
  //     idleAnim.start(); // not needed - this baked in animation starts automatically when mesh is added to the scene
  //     avatarContainer.animationGroups[0].start();
  //   }
  // });

  // player

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

  // run the render loop
  engine.runRenderLoop(() => {
    scene.render();
  });
};

init();
