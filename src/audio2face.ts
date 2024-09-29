import { Vector3, Quaternion } from '@babylonjs/core';
import type { AbstractMesh, AssetContainer } from '@babylonjs/core';
import { setMorphTargetInfluence } from './helpers';

export interface Audio2FaceExportData {
  exportFps: number;
  trackPath: string;
  numPoses: number;
  numFrames: number;
  facsNames: string[]; // FACS (Facial Action Coding System) blend shapes
  weightMat: number[][]; // A 2D array of numbers representing the weight values for each blend shape per frame
  joints: string[];
  rotations: number[][][]; // A 3D array representing rotation quaternions for each joint in each frame
  translations: number[][][]; // A 3D array representing translation vectors for each joint in each frame
}

// TODO: join applyBlendShapes & applyJointTransforms in one function to call it only once?

/**
 * Applies blend shape weights to the avatar for a given frame.
 *
 * @param {number} frameIndex - The current frame index in the animation.
 * @param {Audio2FaceExportData} a2faceData - The Audio2Face data containing blend shape information.
 * @param {AssetContainer} assetContainer - The asset container containing the avatar's morph targets.
 *
 * @example
 * // Assuming you've loaded your model into an AssetContainer called 'avatarContainer'
 * const avatarContainer = await SceneLoader.LoadAssetContainerAsync("path/to/model", "avatar.glb", scene);
 * const a2faceData = fetch(...) // TODO: use custom gRPC endpoint to get data streamed from Nvidia Audio2Face?
 *
 * // Animate
 * let frame = 0;
 * scene.onBeforeRenderObservable.add(() => {
 *   applyBlendShapes(frame, a2faceData, avatarContainer);
 *   frame = (frame + 1) % a2faceData.numFrames;
 * });
 */
export function applyBlendShapes(
  frameIndex: number,
  a2faceData: Audio2FaceExportData,
  assetContainer: AssetContainer
) {
  const weights = a2faceData.weightMat[frameIndex];
  for (let i = 0; i < a2faceData.facsNames.length; i++) {
    const targetName = a2faceData.facsNames[i];
    const influence = weights[i];
    setMorphTargetInfluence(assetContainer, targetName, influence);
  }
}

// Apply joint transformations
export function applyJointTransforms(
  frameIndex: number,
  a2faceData: Audio2FaceExportData,
  mesh: AbstractMesh
) {
  const rotations = a2faceData.rotations[frameIndex];
  const translations = a2faceData.translations[frameIndex];

  if (mesh.skeleton && a2faceData.joints) {
    for (let i = 0; i < a2faceData.joints.length; i++) {
      const joint = mesh.skeleton.bones.find(
        // TODO: temporary fix for the eye bones, we should rename them in the model
        (b) =>
          b.name === a2faceData.joints[i] ||
          (a2faceData.joints[i] === 'eye_R' && b.name === 'RightEye') ||
          (a2faceData.joints[i] === 'eye_L' && b.name === 'LeftEye')
      );
      if (joint) {
        joint.setRotationQuaternion(Quaternion.FromArray(rotations[i]));
        joint.setPosition(Vector3.FromArray(translations[i]));
      }
    }
  } // TODO: throw error otherwise?
}

// morph targets taken from Avaturn model, based on ARKit + visemes
export const allMorphTargets = [
  'browDownLeft',
  'browDownRight',
  'browInnerUp',
  'browOuterUpLeft',
  'browOuterUpRight',
  'cheekPuff',
  'cheekSquintLeft',
  'cheekSquintRight',
  'eyeBlinkLeft',
  'eyeBlinkRight',
  'eyeLookDownLeft',
  'eyeLookDownRight',
  'eyeLookInLeft',
  'eyeLookInRight',
  'eyeLookOutLeft',
  'eyeLookOutRight',
  'eyeLookUpLeft',
  'eyeLookUpRight',
  'eyeSquintLeft',
  'eyeSquintRight',
  'eyeWideLeft',
  'eyeWideRight',
  'eyesClosed',
  'eyesLookDown',
  'eyesLookUp',
  'jawForward',
  'jawLeft',
  'jawOpen',
  'jawRight',
  'mouthClose',
  'mouthDimpleLeft',
  'mouthDimpleRight',
  'mouthFrownLeft',
  'mouthFrownRight',
  'mouthFunnel',
  'mouthLeft',
  'mouthLowerDownLeft',
  'mouthLowerDownRight',
  'mouthOpen',
  'mouthPressLeft',
  'mouthPressRight',
  'mouthPucker',
  'mouthRight',
  'mouthRollLower',
  'mouthRollUpper',
  'mouthShrugLower',
  'mouthShrugUpper',
  'mouthSmile',
  'mouthSmileLeft',
  'mouthSmileRight',
  'mouthStretchLeft',
  'mouthStretchRight',
  'mouthUpperUpLeft',
  'mouthUpperUpRight',
  'noseSneerLeft',
  'noseSneerRight',
  'tongueOut',
  'viseme_CH',
  'viseme_DD',
  'viseme_E',
  'viseme_FF',
  'viseme_I',
  'viseme_O',
  'viseme_PP',
  'viseme_RR',
  'viseme_SS',
  'viseme_TH',
  'viseme_U',
  'viseme_aa',
  'viseme_kk',
  'viseme_nn',
  'viseme_sil',
];
