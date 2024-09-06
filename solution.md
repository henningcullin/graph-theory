# Solving the Directed Chinese Postman Problem (DCPP) for a Digraph

The Directed Chinese Postman Problem (DCPP) seeks to find the shortest route that visits every edge in a directed graph (digraph) at least once, starting at a specific vertex `a` and ending at a specific vertex `b`. This document outlines the steps to solve the problem.

## Prerequisites

- **Flood Fill**: Ensure the graph is strongly connected.
- **Degree Calculation**: Have the incoming and outgoing degrees for all vertices.

## Steps to Solve DCPP

### 1. Check Graph Feasibility

- **Strong Connectivity**: Confirm the graph is strongly connected (i.e., there is a path between any two vertices). This should be verified with your flood fill.
- **Degree Balance**: For a valid Eulerian path:
  - **Start Vertex `a`**: Should have `d_out(a) = d_in(a) + 1`.
  - **End Vertex `b`**: Should have `d_in(b) = d_out(b) + 1`.
  - **Other Vertices**: All other vertices should have equal in-degrees and out-degrees (`d_in(v) = d_out(v)`).

### 2. Identify Unbalanced Vertices

- For each vertex `v`:
  - Calculate `d_out(v)` and `d_in(v)`.
  - List vertices where `d_out(v) > d_in(v)` and `d_in(v) > d_out(v)`.

### 3. Add Augmented Edges

- **Add Virtual Edges**: If the graph is not already balanced:
  - Add virtual edges to balance in-degrees and out-degrees for unbalanced vertices.
  - Use a minimum cost flow algorithm to add the fewest number of virtual edges.

### 4. Construct the Eulerian Path

- **Hierholzer’s Algorithm**:
  1. **Start** at vertex `a`.
  2. **Follow Edges**: Continue following edges from the current vertex, marking them as traveled.
  3. **Backtrack**: If stuck (no more unvisited edges), backtrack to a previously visited vertex with unvisited edges and continue.
  4. **Complete**: Continue until all edges have been visited exactly once.

### 5. Remove Virtual Edges

- **Substitute Virtual Edges**: Replace virtual edges in your Eulerian path with the shortest real path corresponding to those virtual edges.

### 6. Output the Eulerian Path

- **Final Path**: The result will be an ordered list of edges representing the path from vertex `a` to vertex `b`, traversing every edge at least once.

## Example

For a digraph with:

- **Vertices**: `a`, `b`, `c`
- **Edges**: `(a, b)`, `(b, c)`, `(c, a)`, `(b, a)`

**Degrees**:

- `a`: out-degree = 1, in-degree = 1
- `b`: out-degree = 2, in-degree = 2
- `c`: out-degree = 1, in-degree = 1

**Eulerian Path**: Since the degrees are balanced, a possible Eulerian path is: `a -> b -> a -> c -> b -> c -> a`.

Use this Markdown document as a reference for coding your solution to the Directed Chinese Postman Problem.
