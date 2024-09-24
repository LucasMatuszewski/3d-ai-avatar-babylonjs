import bpy

# Print number of Shape Keys for every mesh


def count_shapekeys_number():
    # Initialize total count of all shape keys
    total_blendshapes = 0

    print("Number of Shape Keys for object:")
    for obj in bpy.data.objects:
        # Check if the object is of type 'MESH'
        if obj.type == "MESH":
            # Check if the object has shape keys
            if obj.data.shape_keys:
                num_blendshapes = len(obj.data.shape_keys.key_blocks)
            else:
                num_blendshapes = 0

            # Add to the total count
            total_blendshapes += num_blendshapes

            # Print the object name and the number of blendshapes
            print(f"- {obj.name}: {num_blendshapes}")

    print(f"Total number of blendshapes for all objects: {total_blendshapes}")
    return total_blendshapes
