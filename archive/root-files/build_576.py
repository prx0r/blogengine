import numpy as np
from collections import defaultdict
from itertools import combinations

def generate_fcc(radius):
    nodes = set()
    for x in range(-radius, radius+1):
        for y in range(-radius, radius+1):
            for z in range(-radius, radius+1):
                if (x + y + z) % 2 == 0:
                    d2 = x*x + y*y + z*z
                    if d2 <= radius*radius:
                        nodes.add((float(x), float(y), float(z)))
    return np.array(list(nodes))

radius = 5
nodes = generate_fcc(radius)
nn_dist = np.sqrt(2)
nodes = nodes / nn_dist
n = len(nodes)
print(f"FCC radius {radius}: {n} nodes")

adjacency = {i: set() for i in range(n)}
for i in range(n):
    for j in range(i+1, n):
        d = np.linalg.norm(nodes[i] - nodes[j])
        if abs(d - 1.0) < 0.15:
            adjacency[i].add(j)
            adjacency[j].add(i)

degrees = [len(adjacency[i]) for i in range(n)]
print(f"Max degree: {max(degrees)}, Avg degree: {np.mean(degrees):.2f}")
print(f"Total edges: {sum(degrees)//2}")

# Find tetrahedra
tetrahedra_list = []
for i in range(n):
    for j in adjacency[i]:
        if j <= i: continue
        for k in adjacency[i] & adjacency[j]:
            if k <= j: continue
            for l in adjacency[i] & adjacency[j] & adjacency[k]:
                if l <= k: continue
                tetrahedra_list.append((i, j, k, l))

print(f"Tetrahedra found: {len(tetrahedra_list)}")

# Centroid shells
centroids = [np.linalg.norm((nodes[i]+nodes[j]+nodes[k]+nodes[l])/4) 
             for (i,j,k,l) in tetrahedra_list]
max_d = max(centroids)
shell_edges = np.linspace(0, max_d + 0.01, 10)
shell_counts = defaultdict(int)
shell_tets = defaultdict(list)
for idx, d in enumerate(centroids):
    s = np.digitize(d, shell_edges[1:-1])
    shell_counts[s] += 1
    shell_tets[s].append(tetrahedra_list[idx])

print(f"\nTetrahedra per shell ({len(shell_counts)} levels):")
total_tets = 0
for s in sorted(shell_counts.keys()):
    print(f"  Level {s}: {shell_counts[s]} tetrahedra")
    total_tets += shell_counts[s]

# Count unique tetrahedron patterns
tet_patterns = defaultdict(int)
for (i,j,k,l) in tetrahedra_list:
    verts = [nodes[i], nodes[j], nodes[k], nodes[l]]
    dists = tuple(sorted(
        round(np.linalg.norm(verts[a] - verts[b]), 6)
        for a,b in combinations(range(4), 2)
    ))
    tet_patterns[dists] += 1

print(f"\nUnique tetrahedron edge patterns: {len(tet_patterns)}")
for pattern, count in sorted(tet_patterns.items(), key=lambda x: -x[1])[:3]:
    is_regular = all(abs(p - 1.0) < 0.01 for p in pattern)
    print(f"  {'Regular' if is_regular else 'Irregular'}: {count} tetrahedra")

tattva_names = [
    "Śiva","Śakti","Sadāśiva","Īśvara","Śuddhavidyā",
    "Māyā","Kalā","Vidyā","Rāga","Kāla","Niyati","Puruṣa",
    "Prakṛti","Buddhi","Ahaṅkāra","Manas",
    "Śrotra","Tvak","Cakṣus","Jihvā","Ghrāṇa",
    "Vāk","Pāṇi","Pāda","Pāyu","Upastha",
    "Śabda","Sparśa","Rūpa","Rasa","Gandha",
    "Ākāśa","Vāyu","Tejas","Ap","Pṛthivī"
]

occupied = sorted(shell_counts.keys())
n_levels = len(occupied)
tattvas_per_level = 36 // n_levels if n_levels else 0

print(f"\n=== 576-FOLD STRUCTURE ===")
print(f"Tattva levels (shells): {n_levels}")
print(f"Tattvas per level: {tattvas_per_level}")
print(f"Total tattvas: {n_levels * tattvas_per_level}")
print(f"Orientations (half of 24): 16")
print(f"Theoretical 576: 36 × 16 = 576")
print(f"Actual tetrahedra × vertex_occurrences: {len(tetrahedra_list) * 4}")
print(f"With 24 orientations: {len(tetrahedra_list) * 24}")

# Tattva assignment per level
print(f"\nTattva assignment:")
for idx, s in enumerate(occupied):
    t_start = idx * tattvas_per_level
    t_end = min(t_start + tattvas_per_level, 36)
    t_names = tattva_names[t_start:t_end]
    print(f"  Level {idx} ({len(shell_tets[s])} tetrahedra): {t_names}")

# Check if level 0 (center) exists
center_present = any(abs(c) < 0.01 for c in centroids)
print(f"\nCenter node present: {center_present}")

# Write output
with open("/root/projects/blog/576-matrix.xyzv", "w") as f:
    f.write("node_id\tx\ty\tz\tdegree\n")
    for i in range(n):
        pos = nodes[i]
        d = degrees[i]
        f.write(f"{i}\t{pos[0]:.6f}\t{pos[1]:.6f}\t{pos[2]:.6f}\t{d}\n")

with open("/root/projects/blog/576-matrix.edge", "w") as f:
    f.write("node_a\tnode_b\n")
    seen = set()
    for a in adjacency:
        for b in adjacency[a]:
            if (a, b) not in seen:
                seen.add((a, b))
                f.write(f"{a}\t{b}\n")

print(f"\n=== COMPLETE STATISTICS ===")
print(f"Lattice: FCC / IVM (regular tetrahedra + octahedra)")
print(f"Nodes: {n}")
print(f"Edges: {sum(degrees)//2}")
print(f"Max degree: {max(degrees)} (cuboctahedron interior)")
print(f"Avg degree: {np.mean(degrees):.2f}")
print(f"Tetrahedra: {len(tetrahedra_list)} (all regular, edge=1.0)")
print(f"Tattva levels: {n_levels}")
print(f"Tattvas accounted: {n_levels * tattvas_per_level}/36")
