import bpy

# Script to delete all shapekeys with no or minimal effect on vertices
minimum_vertices_affected_to_keep = 80


# Function to count vertices affected by a shape key
def count_affected_vertices(shape_key_block):
    base_mesh = shape_key_block.relative_key
    affected_count = 0

    for i, key_point in enumerate(shape_key_block.data):
        # Check if the vertex has moved from its base position
        if (key_point.co - base_mesh.data[i].co).length > 0:
            affected_count += 1

    return affected_count


def measure_shape_key_size(shape_key_block):
    data_count = len(shape_key_block.data)  # Number of affected vertices (unique data)
    points_count = len(shape_key_block.points)  # Number of points stored
    print(f"- data elements: {data_count}, Points: {points_count}")


# Function to measure shape key size
def measure_shape_key_size_and_filter(shape_key_block):
    affected_count = count_affected_vertices(shape_key_block)

    if affected_count < minimum_vertices_affected_to_keep:
        print(f"\nShape Key '{shape_key_block.name}'")
        print(f"- affects {affected_count} vertices")
        measure_shape_key_size(shape_key_block)
        print("- will be deleted! X")
        return True
    else:
        print(
            f"\nShape Key '{shape_key_block.name}' affects {affected_count} vertices. No deletion."
        )
        return False


# Iterate over all objects in the scene
for obj in bpy.context.scene.objects:
    if obj.type == "MESH" and obj.data.shape_keys:
        print("------------------------")
        print(f"\nObject: {obj.name}")
        shape_keys = obj.data.shape_keys.key_blocks

        # List to store the shape keys to be deleted
        shape_keys_to_delete = []

        # Collect shape keys that have less than 10 affected vertices
        for shape_key in shape_keys:
            if shape_key.name != "Basic" and measure_shape_key_size_and_filter(
                shape_key
            ):
                shape_keys_to_delete.append(shape_key.name)

        print("\n XXXXXX All Shapekeys to delete:")
        print(shape_keys_to_delete)

        # Delete the shape keys with fewer than 10 affected vertices
        for shape_key_name in shape_keys_to_delete:
            print(f"Deleting Shape Key '{shape_key_name}' from object '{obj.name}'.")
            obj.shape_key_remove(obj.data.shape_keys.key_blocks[shape_key_name])

print("Finished checking and deleting shape keys.")
