import bpy


def new_shapekey_from_pose(shapekey_name, bone_modifications, armature_name=None):
    """
    Create a new shape key on the currently selected mesh object based on
    bone modifications.

    Args:
        shapekey_name (str): The name of the shape key to create.
        bone_modifications (list[dict]): A list of dictionaries containing bone
            modifications. Each dictionary should have the following keys:

                bone (str): The name of the bone to modify.
                x (float, optional): The amount of rotation around the X axis in
                    degrees. Defaults to 0.
                y (float, optional): The amount of rotation around the Y axis in
                    degrees. Defaults to 0.
                z (float, optional): The amount of rotation around the Z axis in
                    degrees. Defaults to 0.

        armature_name (str, optional): The name of the armature to use for the
            shape key. If not provided, the first armature modifier found will be
            used. Defaults to None.

    Returns:
        None
    """

    obj = bpy.context.object
    if not obj.data or not hasattr(obj.data, "shape_keys"):
        print(
            "The selected object must have shape keys. Please select a mesh object and try again."
        )
        return

    mesh_name = obj.name

    initial_shape_keys_count = (
        len(obj.data.shape_keys.key_blocks) if obj.data.shape_keys else 0
    )

    if obj.data.shape_keys and shapekey_name in obj.data.shape_keys.key_blocks:
        print(f"Shape key '{shapekey_name}' already exists. Aborting.")
        return

    armature_modifier = None
    if armature_name:
        for mod in obj.modifiers:
            if (
                mod.type == "ARMATURE"
                and mod.object
                and mod.object.name == armature_name
            ):
                armature_modifier = mod
                break
        if not armature_modifier:
            print(
                f"No Armature Modifier found for the provided armature '{armature_name}'."
            )
            return
    else:
        for mod in obj.modifiers:
            if mod.type == "ARMATURE":
                armature_modifier = mod
                armature_name = mod.object.name
                break
        if not armature_modifier:
            print("No armature modifier found for the selected mesh.")
            return

    armature = bpy.data.objects.get(armature_name)

    if not armature:
        print(f"Armature '{armature_name}' not found.")
        return

    bpy.context.view_layer.objects.active = armature
    bpy.ops.object.mode_set(mode="POSE")

    for modification in bone_modifications:
        bone_name = modification.get("bone")
        bone = armature.pose.bones.get(bone_name)

        if not bone:
            print(f"Bone '{bone_name}' not found.")
            continue

        bone.rotation_mode = "XYZ"
        x_rotation = modification.get("x", 0) * (3.14159 / 180)
        y_rotation = modification.get("y", 0) * (3.14159 / 180)
        z_rotation = modification.get("z", 0) * (3.14159 / 180)
        bone.rotation_euler[0] += x_rotation
        bone.rotation_euler[1] += y_rotation
        bone.rotation_euler[2] += z_rotation

        print(
            f"Applied to bone '{bone_name}': X: {x_rotation}, Y: {y_rotation}, Z: {z_rotation}"
        )

    bpy.context.view_layer.objects.active = bpy.data.objects[mesh_name]
    bpy.ops.object.mode_set(mode="OBJECT")

    try:
        bpy.ops.object.modifier_apply_as_shapekey(
            keep_modifier=True, modifier=armature_modifier.name
        )
    except Exception as e:
        print(f"Error applying Armature modifier as shape key: {e}")
        return

    new_shape_keys_count = (
        len(obj.data.shape_keys.key_blocks) if obj.data.shape_keys else 0
    )
    if new_shape_keys_count <= initial_shape_keys_count:
        print("Error: No new shape key was created.")
        return

    new_shapekey = obj.data.shape_keys.key_blocks[-1]
    new_shapekey.name = shapekey_name

    print(f"Shape key '{shapekey_name}' created and applied.")

    bpy.context.view_layer.objects.active = armature
    bpy.ops.object.mode_set(mode="POSE")
    bpy.ops.pose.rot_clear()

    bpy.context.view_layer.objects.active = bpy.data.objects[mesh_name]
    bpy.ops.object.mode_set(mode="OBJECT")

    bpy.ops.ed.undo_push(message=f"Shapekey '{shapekey_name}' created from pose")

    print("Armature reset, and the process is complete.")


new_shapekey_from_pose(
    "eyeWideRight",
    [{"bone": "r_eyelidupper", "x": -15}, {"bone": "r_eyelidlower", "x": -5}],
)

new_shapekey_from_pose(
    "eyeWideLeft",
    [{"bone": "l_eyelidupper", "x": -15}, {"bone": "l_eyelidlower", "x": -5}],
)
