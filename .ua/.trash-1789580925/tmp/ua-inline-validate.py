import json
import sys

graph_path, output_path = sys.argv[1], sys.argv[2]
with open(graph_path, encoding="utf-8") as f:
    graph = json.load(f)

issues, warnings = [], []
if not isinstance(graph.get("nodes"), list):
    issues.append("graph.nodes is missing or not an array")
    graph["nodes"] = []
if not isinstance(graph.get("edges"), list):
    issues.append("graph.edges is missing or not an array")
    graph["edges"] = []

node_ids = set()
seen = {}
for i, n in enumerate(graph["nodes"]):
    nid = n.get("id")
    if not nid:
        issues.append(f"Node[{i}] missing id")
        continue
    if not n.get("type"):
        issues.append(f"Node[{i}] '{nid}' missing type")
    if not n.get("name"):
        issues.append(f"Node[{i}] '{nid}' missing name")
    if not n.get("summary"):
        issues.append(f"Node[{i}] '{nid}' missing summary")
    if not n.get("tags"):
        issues.append(f"Node[{i}] '{nid}' missing tags")
    if nid in seen:
        issues.append(f"Duplicate node ID '{nid}'")
    else:
        seen[nid] = i
    node_ids.add(nid)

for i, e in enumerate(graph["edges"]):
    if e.get("source") not in node_ids:
        issues.append(f"Edge[{i}] source '{e.get('source')}' not found")
    if e.get("target") not in node_ids:
        issues.append(f"Edge[{i}] target '{e.get('target')}' not found")

file_level_types = {
    "file", "config", "document", "service", "pipeline",
    "table", "schema", "resource", "endpoint",
}
file_nodes = [n["id"] for n in graph["nodes"] if n.get("type") in file_level_types and n.get("id")]
assigned = {}
if not isinstance(graph.get("layers"), list):
    warnings.append("graph.layers is not an array")
    graph["layers"] = []
if not isinstance(graph.get("tour"), list):
    warnings.append("graph.tour is not an array")
    graph["tour"] = []

for layer in graph["layers"]:
    for nid in layer.get("nodeIds") or []:
        if nid not in node_ids:
            issues.append(f"Layer '{layer.get('id')}' refs missing node '{nid}'")
        if nid in assigned:
            issues.append(f"Node '{nid}' appears in multiple layers")
        assigned[nid] = layer.get("id")

for nid in file_nodes:
    if nid not in assigned:
        issues.append(f"File node '{nid}' not in any layer")

for i, step in enumerate(graph["tour"]):
    for nid in step.get("nodeIds") or []:
        if nid not in node_ids:
            issues.append(f"Tour step[{i}] refs missing node '{nid}'")

with_edges = set()
for e in graph["edges"]:
    with_edges.add(e.get("source"))
    with_edges.add(e.get("target"))
for n in graph["nodes"]:
    if n.get("id") and n["id"] not in with_edges:
        warnings.append(f"Node '{n['id']}' has no edges (orphan)")

node_types = {}
for n in graph["nodes"]:
    t = n.get("type") or "unknown"
    node_types[t] = node_types.get(t, 0) + 1
edge_types = {}
for e in graph["edges"]:
    t = e.get("type") or "unknown"
    edge_types[t] = edge_types.get(t, 0) + 1

stats = {
    "totalNodes": len(graph["nodes"]),
    "totalEdges": len(graph["edges"]),
    "totalLayers": len(graph["layers"]),
    "tourSteps": len(graph["tour"]),
    "nodeTypes": node_types,
    "edgeTypes": edge_types,
}

with open(output_path, "w", encoding="utf-8") as f:
    json.dump({"issues": issues, "warnings": warnings, "stats": stats}, f, indent=2)
