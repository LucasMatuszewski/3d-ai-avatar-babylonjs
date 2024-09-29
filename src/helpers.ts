import type { AssetContainer, Scene } from '@babylonjs/core';

import {
  Control,
  Slider,
  ScrollViewer,
  StackPanel,
  TextBlock,
} from '@babylonjs/gui';
import type { AdvancedDynamicTexture } from '@babylonjs/gui';

/**
 * Retrieves all unique morph target names from an AssetContainer's morphTargetManagers.
 *
 * @param assetContainer - The AssetContainer containing the morph targets.
 * @returns An array of unique morph target names, sorted alphabetically.
 *
 * @description
 * This function iterates through all morphTargetManagers in the given AssetContainer,
 * collects all morph target names, removes duplicates, and returns a sorted array of unique names.
 *
 * @example
 * const assetContainer = await loadAssetContainerAsync(avatarFile, scene);
 * const allMorphTargets = getAllMorphTargets(assetContainer);
 * console.log(allMorphTargets);
 */

export function getAllMorphTargets(assetContainer: AssetContainer) {
  return [
    ...new Set(
      assetContainer.morphTargetManagers.flatMap((manager) => {
        if (!manager) return [];
        const targets: string[] = [];
        for (let i = 0; i < manager.numTargets; i++) {
          const target = manager.getTarget(i);
          if (target?.name) {
            targets.push(target.name);
          }
        }
        return targets;
      })
    ),
  ].sort();
}

export const setMorphTargetInfluence = (
  avatarContainer: AssetContainer,
  targetName: string,
  influence: number
): void => {
  avatarContainer.morphTargetManagers.forEach((manager) => {
    if (manager) {
      const target = manager.getTargetByName(targetName);
      if (target) {
        // const currentInfluence = target.influence; // Current influence from idle animation
        // // Blend the influences (you can adjust the blending method)
        // const blendedInfluence = (influence + currentInfluence) / 2;
        // target.influence = blendedInfluence;
        target.influence = influence;
      }
    }
  });
};

export const createMorphTargetSliderGUI = (
  avatarContainer: AssetContainer,
  scene: Scene,
  advancedTexture: AdvancedDynamicTexture
) => {
  // TODO: on Prod take them from a saved array (in audio2face.ts file)
  const allMorphTargets = getAllMorphTargets(avatarContainer);
  // console.log('allMorphTargets', allMorphTargets);

  // Create a scrollable container for the stack panel
  const scrollViewer = new ScrollViewer();
  scrollViewer.width = '320px';
  scrollViewer.height = '80%';
  scrollViewer.left = '10px';
  scrollViewer.top = '10px';
  scrollViewer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  scrollViewer.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  advancedTexture.addControl(scrollViewer);

  // To prevent the camera to zoom in/out when scrolling over the GUI:
  // Detach camera controls when pointer enters the ScrollViewer
  scrollViewer.onPointerEnterObservable.add(() => {
    scene.activeCamera?.detachControl();
  });

  // Reattach camera controls when pointer leaves the ScrollViewer
  scrollViewer.onPointerOutObservable.add(() => {
    scene.activeCamera?.attachControl(
      scene.getEngine().getRenderingCanvas(),
      true
    );
  });

  // Create a stack panel to hold all sliders
  const stackPanel = new StackPanel();
  stackPanel.width = '100%';
  scrollViewer.addControl(stackPanel);

  // Add a title for the morph targets
  const titleText = new TextBlock();
  titleText.text = 'Morph Targets';
  titleText.color = 'white';
  titleText.fontSize = 20;
  titleText.height = '40px';
  titleText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
  stackPanel.addControl(titleText);

  // Create sliders for each morph target
  allMorphTargets.forEach((targetName) => {
    const header = new TextBlock();
    header.text = targetName;
    header.height = '30px';
    header.color = 'white';
    stackPanel.addControl(header);

    const slider = new Slider();
    slider.minimum = 0;
    slider.maximum = 1;
    slider.value = 0;
    slider.height = '20px';
    slider.width = '200px';
    slider.color = 'blue';
    slider.background = 'grey';
    stackPanel.addControl(slider);

    // Add event listener to update morph target influence
    slider.onValueChangedObservable.add((value) => {
      setMorphTargetInfluence(avatarContainer, targetName, value);
    });
  });
};
