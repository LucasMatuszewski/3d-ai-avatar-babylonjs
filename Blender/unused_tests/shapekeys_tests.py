import bpy

# Shape key names to investigate
shape_key_names = [
    "tear_l",
    "tear_r",
    "Brow Down Mix",
    "Brow Down",
    "Brow Down Mix from without group",
    "Eye Blink",
    "Eye Blink Left",
    "Eye Blink Right",
]


# Function to count vertices affected by a shape key
def count_affected_vertices(shape_key_block):
    base_mesh = shape_key_block.relative_key
    affected_count = 0

    for i, key_point in enumerate(shape_key_block.data):
        # Check if the vertex has moved from its base position
        if (key_point.co - base_mesh.data[i].co).length > 0:
            affected_count += 1

    print(f"Affectted vertices: {affected_count}")
    return affected_count


def print_shape_key_block_props(shape_key_block):
    print(f"Vertex group: '{shape_key_block.vertex_group}'")
    # Print all the attributes and methods of the shape key block
    #    print("\nAttributes and methods of shape key:")
    #    print(dir(shape_key_block))

    print("\nAttributes and methods of first data element:")
    print(dir(shape_key_block.data[0]))
    print(f"data coordinates (co): '{shape_key_block.data[0].co}'")
    print(f"data bl_rna: '{shape_key_block.data[0].bl_rna}'")
    print(f"data rna_type: '{shape_key_block.data[0].rna_type}'")

    print("\nAttributes and methods of first points element:")
    print(dir(shape_key_block.points[0]))
    print(f"point coordinates (co): '{shape_key_block.points[0].co}'")
    print(f"point bl_rna: '{shape_key_block.points[0].bl_rna}'")
    print(f"point rna_type: '{shape_key_block.points[0].rna_type}'")

    # To see all the properties and their current values, use the following:


#    print("\nCurrent values of the shape key block properties:")
#    for prop in dir(shape_key_block):
#        try:
#            print(f"{prop}: {getattr(shape_key_block, prop)}")
#        except:
#            print(f"{prop}: [Unable to access]")


def measure_shape_key_size(shape_key_block):
    data_count = len(shape_key_block.data)  # Number of affected vertices (unique data)
    points_count = len(shape_key_block.points)  # Number of points stored
    print(f"Data elements: {data_count}, Points: {points_count}")


# Iterate over all objects in the scene
for obj in bpy.context.scene.objects:
    if obj.type == "MESH" and obj.data.shape_keys:
        print("------------------------")
        print(f"\nObject: {obj.name}")
        shape_keys = obj.data.shape_keys.key_blocks

        for shape_key_name in shape_key_names:
            print("\n--")
            if shape_key_name in shape_keys:
                shape_key_block = shape_keys[shape_key_name]
                print(f"\nShape Key '{shape_key_name}'")
                measure_shape_key_size(shape_key_block)
                count_affected_vertices(shape_key_block)
                print_shape_key_block_props(shape_key_block)
            else:
                print(f"Shape Key '{shape_key_name}' not found in object '{obj.name}'.")

print("Finished checking shape keys.")


# Alternatively we can run this script on active object and create a plugin:
# bpy.context.active_object
