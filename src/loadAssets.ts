import { loadAssetContainerAsync } from '@babylonjs/core';

export async function loadAvatarContainer(avatarFile, scene) {
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
  // avatarRoot.rotationQuaternion = new Quaternion(0, 0, 0, 1);
  avatarRoot.rotationQuaternion = null;
  avatarRoot.rotation = new Vector3(0, 3.6, 0);

  return avatarContainer;
}
