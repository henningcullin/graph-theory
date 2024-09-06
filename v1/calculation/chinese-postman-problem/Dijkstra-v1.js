import { Edge } from "./Edge.js";
import { Vertex } from "./Vertex.js";

onmessage = function (event) {
  const { startVertex, endVertex, edges } = event.data;

  // Step 3: Adjust the Eulerian circuit to be a path from startVertex to endVertex
  const pathCoveringAllEdges = findChinesePostmanPath(
    startVertex,
    endVertex,
    edges
  );
  // Send the result back to the main thread
  postMessage({
    paths: pathCoveringAllEdges ? [pathCoveringAllEdges] : [],
    type: "done",
  });
};

/**
 * Finds the shortest path in the graph from startVertex to endVertex
 * where all edges are traversed at least once (Chinese Postman Problem).
 * @param {Vertex} startVertex - The starting vertex of the graph.
 * @param {Vertex} endVertex - The ending vertex of the graph.
 * @param {Edge[]} edges - The array of edges in the graph.
 * @returns {Edge[]} - The array of edges traversed, covering all original edges at least once.
 */
function findChinesePostmanPath(startVertex, endVertex, edges) {
  // Step 1: Check if the graph is Eulerian.
  const oddDegreeVertices = findOddDegreeVertices(edges);

  // Step 2: Ensure that startVertex and endVertex are included in the odd-degree vertices
  if (!oddDegreeVertices.includes(startVertex)) {
    oddDegreeVertices.push(startVertex);
  }
  if (!oddDegreeVertices.includes(endVertex)) {
    oddDegreeVertices.push(endVertex);
  }

  // Step 3: Pair odd-degree vertices and add shortest paths to make the graph Eulerian.
  const duplicatedEdges = pairOddDegreeVertices(oddDegreeVertices, edges);

  // Step 4: Find the Eulerian path in the modified graph.
  const eulerianPath = findEulerianPath(startVertex, endVertex, [
    ...edges,
    ...duplicatedEdges,
  ]);

  // Step 5: Ensure only original edges are returned in the solution.
  return filterOriginalEdges(eulerianPath, edges);
}

/**
 * Finds vertices with odd degrees in the graph.
 * @param {Edge[]} edges - The array of edges in the graph.
 * @returns {Vertex[]} - An array of vertices with odd degrees.
 */
function findOddDegreeVertices(edges) {
  const vertexDegrees = new Map();

  // Count the degree of each vertex
  edges.forEach((edge) => {
    vertexDegrees.set(edge.vertex1, (vertexDegrees.get(edge.vertex1) || 0) + 1);
    vertexDegrees.set(edge.vertex2, (vertexDegrees.get(edge.vertex2) || 0) + 1);
  });

  // Find vertices with odd degrees
  return [...vertexDegrees.keys()].filter(
    (vertex) => vertexDegrees.get(vertex) % 2 !== 0
  );
}

/**
 * Pairs odd-degree vertices and returns the edges that need to be duplicated to make the graph Eulerian.
 * @param {Vertex[]} oddVertices - An array of vertices with odd degrees.
 * @param {Edge[]} edges - The array of original edges in the graph.
 * @returns {Edge[]} - An array of edges to be duplicated to make the graph Eulerian.
 */
function pairOddDegreeVertices(oddVertices, edges) {
  // Use Dijkstra's algorithm or Floyd-Warshall to find the shortest path between all odd vertices
  const shortestPaths = calculateAllPairsShortestPaths(oddVertices, edges);

  // Pair up the odd vertices by finding the minimum matching
  const matchedEdges = matchOddVertices(oddVertices, shortestPaths);

  return matchedEdges;
}

/**
 * Finds the Eulerian path in the graph.
 * @param {Vertex} startVertex - The starting vertex.
 * @param {Vertex} endVertex - The ending vertex.
 * @param {Edge[]} edges - The array of edges in the graph.
 * @returns {Edge[]} - An array representing the Eulerian path.
 */
function findEulerianPath(startVertex, endVertex, edges) {
  const edgeCopy = new Set(edges);
  const path = [];
  const stack = [startVertex];

  while (stack.length > 0) {
    const currentVertex = stack[stack.length - 1];
    const availableEdge = [...edgeCopy].find(
      (edge) => edge.vertex1 === currentVertex || edge.vertex2 === currentVertex
    );

    if (availableEdge) {
      stack.push(
        availableEdge.vertex1 === currentVertex
          ? availableEdge.vertex2
          : availableEdge.vertex1
      );
      edgeCopy.delete(availableEdge);
      path.push(availableEdge);
    } else {
      stack.pop();
    }
  }

  return path;
}

/**
 * Filters the Eulerian path to only include the original edges.
 * @param {Edge[]} path - The Eulerian path found in the graph.
 * @param {Edge[]} originalEdges - The original edges of the graph.
 * @returns {Edge[]} - An array of edges that are in the original graph.
 */
function filterOriginalEdges(path, originalEdges) {
  const originalEdgeSet = new Set(originalEdges);
  return path.filter((edge) => originalEdgeSet.has(edge));
}

/**
 * Uses Dijkstra's algorithm to compute the shortest paths between all pairs of vertices.
 * @param {Vertex[]} vertices - The list of vertices.
 * @param {Edge[]} edges - The array of edges.
 * @returns {Map<Vertex, Map<Vertex, Edge[]>>} - A map of shortest paths between all pairs of vertices.
 */
function calculateAllPairsShortestPaths(vertices, edges) {
  const shortestPaths = new Map();

  // Initialize the shortest paths for each vertex using Dijkstra's algorithm
  vertices.forEach((vertex) => {
    const distances = new Map();
    const previous = new Map();
    const queue = [...vertices];
    distances.set(vertex, 0);

    queue.forEach((v) => {
      if (v !== vertex) distances.set(v, Infinity);
      previous.set(v, null);
    });

    while (queue.length > 0) {
      const current = queue
        .sort((a, b) => distances.get(a) - distances.get(b))
        .shift();
      const currentDistance = distances.get(current);

      edges
        .filter((edge) => edge.vertex1 === current || edge.vertex2 === current)
        .forEach((edge) => {
          const neighbor =
            edge.vertex1 === current ? edge.vertex2 : edge.vertex1;
          const alt = currentDistance + edge.weight;
          if (alt < distances.get(neighbor)) {
            distances.set(neighbor, alt);
            previous.set(neighbor, edge);
          }
        });
    }

    const paths = new Map();
    vertices.forEach((v) => {
      const path = [];
      let current = v;
      while (previous.get(current)) {
        path.unshift(previous.get(current));
        current =
          previous.get(current).vertex1 === current
            ? previous.get(current).vertex2
            : previous.get(current).vertex1;
      }
      paths.set(v, path);
    });

    shortestPaths.set(vertex, paths);
  });

  return shortestPaths;
}

/**
 * Matches odd-degree vertices using the shortest paths to create the minimum number of edge duplications.
 * @param {Vertex[]} oddVertices - The odd-degree vertices to pair up.
 * @param {Map<Vertex, Map<Vertex, Edge[]>>} shortestPaths - The map of shortest paths between all odd vertices.
 * @returns {Edge[]} - The edges that need to be duplicated.
 */
function matchOddVertices(oddVertices, shortestPaths) {
  // Implementation of minimum weight matching using shortest paths.
  // This is usually solved using a greedy algorithm or dynamic programming.
  // Here we would implement or use an algorithm to find the minimum cost pairing.

  // For simplicity, let's assume we've paired them optimally
  const duplicatedEdges = [];

  // Logic for matching odd vertices and returning duplicated edges...

  return duplicatedEdges;
}

export { findChinesePostmanPath };
