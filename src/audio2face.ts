import { Vector3, Quaternion } from '@babylonjs/core';
import type {
  MorphTarget,
  AssetContainer,
  Bone,
  Skeleton,
} from '@babylonjs/core';
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

interface PrecomputedTarget {
  target: MorphTarget;
  name: string;
  influences: Float32Array;
}

export function precomputeBlendShapes(
  avatarContainer: AssetContainer,
  weightMat: Audio2FaceExportData['weightMat'],
  facsNames: Audio2FaceExportData['facsNames']
): PrecomputedTarget[] {
  const targets: PrecomputedTarget[] = [];
  const frameCount = weightMat.length;

  avatarContainer.morphTargetManagers.forEach((manager) => {
    if (manager) {
      for (let i = 0; i < manager.numTargets; i++) {
        const target = manager.getTarget(i);
        if (target && target.name) {
          targets.push({
            target,
            name: target.name,
            influences: new Float32Array(frameCount),
          });
        }
      }
    }
  });

  // Precompute influences for each target for all frames
  for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
    const weights = weightMat[frameIndex];
    for (let i = 0; i < facsNames.length; i++) {
      const value = Math.fround(weights[i]); // Use Math.fround for 32-bit float precision
      if (value !== 0) {
        // Update all targets with matching name
        for (let j = 0; j < targets.length; j++) {
          if (targets[j].name === facsNames[i]) {
            targets[j].influences[frameIndex] = value;
          }
        }
      }
    }
  }

  return targets;
}

export function applyPrecomputedBlendShapes(
  precomputed: PrecomputedTarget[],
  frameIndex: number
): void {
  for (let i = 0; i < precomputed.length; i++) {
    const targetData = precomputed[i];
    const newInfluence = targetData.influences[frameIndex];
    if (Math.abs(targetData.target.influence - newInfluence) > 0.001) {
      targetData.target.influence = newInfluence;
    }
  }
}

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
  weightMat: Audio2FaceExportData['weightMat'],
  facsNames: Audio2FaceExportData['facsNames'],
  assetContainer: AssetContainer
) {
  const weights = weightMat[frameIndex];
  for (let i = 0; i < facsNames.length; i++) {
    const targetName = facsNames[i];
    const influence = weights[i];
    setMorphTargetInfluence(assetContainer, targetName, influence);
  }
}

export function preselectJoints(skeleton: Skeleton, joints: string[]): Bone[] {
  const preselectedJoints: Bone[] = [];
  if (skeleton && joints.length > 0) {
    for (const jointName of joints) {
      const bone = skeleton.bones.find(
        (b) =>
          b.name === jointName ||
          (jointName === 'eye_R' && b.name === 'RightEye') ||
          (jointName === 'eye_L' && b.name === 'LeftEye')
      );
      if (bone) {
        preselectedJoints.push(bone);
      } // TODO: throw error/warning otherwise?
    }
  }

  return preselectedJoints;
}

export function applyJointTransforms(
  frameIndex: number,
  rotationsData: Audio2FaceExportData['rotations'],
  translationsData: Audio2FaceExportData['translations'],
  preselectedJoints: Bone[]
) {
  const rotations = rotationsData[frameIndex];
  const translations = translationsData[frameIndex];

  for (let i = 0; i < preselectedJoints.length; i++) {
    const joint = preselectedJoints[i];
    if (joint) {
      joint.setRotationQuaternion(Quaternion.FromArray(rotations[i]));
      joint.setPosition(Vector3.FromArray(translations[i]));
    }
  }
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
