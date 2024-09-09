import { Vector3, Quaternion } from '@babylonjs/core';
import type { AbstractMesh } from '@babylonjs/core';

interface Audio2FaceExportData {
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
 * Applies blend shape weights to the avatar mesh for a given frame.
 *
 * @param {number} frameIndex - The current frame index in the animation.
 * @param {any} a2faceData - The Audio2Face data containing blend shape information.
 * @param {AbstractMesh} mesh - The avatar mesh to apply the blend shapes to.
 *
 * @example
 * // Assuming you've loaded your model and it's called 'avatar'
 * const avatar = scene.getMeshByName('avatar');
 * const a2faceData = fetch(...) // TODO: use custom gRPC endpoint to get data streamed from Nvidia Audio2Face?
 *
 * // Animate
 * let frame = 0;
 * scene.onBeforeRenderObservable.add(() => {
 *   applyBlendShapes(frame, a2faceData, avatar);
 *   frame = (frame + 1) % a2faceData.numFrames;
 * });
 */
export function applyBlendShapes(
  frameIndex: number,
  a2faceData: Audio2FaceExportData,
  mesh: AbstractMesh
) {
  const weights = a2faceData.weightMat[frameIndex];
  if (mesh.morphTargetManager) {
    for (let i = 0; i < a2faceData.facsNames.length; i++) {
      mesh.morphTargetManager.getTarget(i).influence = weights[i];
    }
  } // TODO: throw error otherwise?
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
        (b) => b.name === a2faceData.joints[i]
      );
      if (joint) {
        joint.setRotationQuaternion(Quaternion.FromArray(rotations[i]));
        joint.setPosition(Vector3.FromArray(translations[i]));
      }
    }
  } // TODO: throw error otherwise?
}
