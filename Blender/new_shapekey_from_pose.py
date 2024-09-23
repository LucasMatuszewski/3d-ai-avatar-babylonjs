import bpy
# from mathutils import *

# D = bpy.data
# C = bpy.context


def new_shapekey_from_pose(shapekey_name, bone_modifications, armature_name=None):
    # Get the currently selected mesh object
    obj = bpy.context.object
    mesh_name = obj.name  # Store the mesh name to reselect it later

    # Check if the mesh has the requested shape key
    if obj.data.shape_keys and shapekey_name in obj.data.shape_keys.key_blocks:
        print(f"Shape key '{shapekey_name}' already exists. Aborting.")
        return

    # Find the armature controlling the selected mesh
    if not armature_name:
        # If no armature name is provided, try to find it from the modifiers
        for mod in obj.modifiers:
            if mod.type == 'ARMATURE':
                armature_name = mod.object.name
                break
        if not armature_name:
            print("No armature found for the selected mesh.")
            return

    armature = bpy.data.objects.get(armature_name)

    if not armature:
        print(f"Armature '{armature_name}' not found.")
        return

    # Switch to Pose Mode to modify bones
    bpy.context.view_layer.objects.active = armature
    bpy.ops.object.mode_set(mode='POSE')

    # Apply modifications to each bone
    for modification in bone_modifications:
        bone_name = modification.get('bone')
        bone = armature.pose.bones.get(bone_name)

        if not bone:
            print(f"Bone '{bone_name}' not found.")
            continue

        # Apply rotations based on modification data
        bone.rotation_mode = 'XYZ'
        x_rotation = modification.get('x', 0) * (3.14159 / 180)  # Convert to radians
        y_rotation = modification.get('y', 0) * (3.14159 / 180)
        z_rotation = modification.get('z', 0) * (3.14159 / 180)
        bone.rotation_euler[0] += x_rotation
        bone.rotation_euler[1] += y_rotation
        bone.rotation_euler[2] += z_rotation

        print(f"Applied to bone '{bone_name}': X: {x_rotation}, Y: {y_rotation}, Z: {z_rotation}")

    # Switch back to the mesh in Object Mode and apply the Armature modifier as a shape key
    bpy.context.view_layer.objects.active = bpy.data.objects[mesh_name]
#    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode='OBJECT')

    # Apply the Armature modifier as a new shape key
    bpy.ops.object.modifier_apply_as_shapekey(keep_modifier=True, modifier="Armature")

    # Rename the new shape key
    new_shapekey = obj.data.shape_keys.key_blocks[-1]
    new_shapekey.name = shapekey_name

    # Reset the armature to its default pose
    bpy.context.view_layer.objects.active = armature
    bpy.ops.object.mode_set(mode='POSE')
    bpy.ops.pose.rot_clear()  # Clear all rotations for all bones

    # Switch back to Object Mode and reselect the original mesh
    bpy.context.view_layer.objects.active = bpy.data.objects[mesh_name]
    bpy.ops.object.mode_set(mode='OBJECT')

    print(f"Shape key '{shapekey_name}' created and applied.")
    print("Armature reset, and the process is complete.")


# Bones to modify and convert to shapekeys:
# Remember to select the mesh first!
new_shapekey_from_pose('eyeWideRight', [{'bone': 'r_eyelidupper', 'x': -10, 'y': 5}, {'bone': 'r_eyelidlower', 'x': 5}])
