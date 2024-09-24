import bpy

# Iterate over all objects in the scene
for obj in bpy.data.objects:
    # Check if the object has an Armature modifier
    has_armature_modifier = False
    for modifier in obj.modifiers:
        if modifier.type == "ARMATURE":
            has_armature_modifier = True
            break

    # If the object has an armature modifier or is directly parented to an armature
    if (has_armature_modifier or obj.find_armature()) and obj.parent:
        # Unparent the object but keep transformations
        obj.parent = None
        # Apply all transformations (location, rotation, scale)
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
