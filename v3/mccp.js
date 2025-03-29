import { unwrap } from "../calculation/v2/utils.js";
import { GraphHandler } from "../graph/GraphHandler.js";
import { Vertex } from "../graph/Vertex.js";
import { dijkstra } from "../v2/dijkstra.js";

/**
 *
 * @param {Vertex} startVertex
 * @param {Vertex} endVertex
 * @param {GraphHandler} graphHandler
 */
export function solve_mccp(startVertex, endVertex, graphHandler) {
  const odd_vertices = get_odd_verticies(graphHandler.graph.vertices);

  console.log("graph hander", graphHandler);

  console.log("odd verticies", odd_vertices);

  const best_odd_pairings = get_least_cost_odd_pairings(odd_vertices);

  console.log("best odd pairings", best_odd_pairings);

  const best_odd_paths = best_odd_pairings.map(function ([
    startVertexId,
    endVertexId,
  ]) {
    const startVertex = graphHandler.graph.vertices.find(
      (vertex) => vertex.id === startVertexId
    );
    const endVertex = graphHandler.graph.vertices.find(
      (vertex) => vertex.id === endVertexId
    );
    return unwrap(dijkstra(unwrap(startVertex), unwrap(endVertex), true));
  });

  console.log("best odd paths", best_odd_paths);

  best_odd_paths.forEach(({ path }) =>
    path.forEach((edge) => graphHandler.graph.cloneEdge(edge.id))
  );
}

/**
 *
 * @param {number} number
 * @returns {boolean}
 */
const isOdd = (number) => number % 2 !== 0;

/**
 *
 * @param {Vertex[]} vertices
 * @returns {Vertex[]}
 */
function get_odd_verticies(vertices) {
  return vertices.reduce(
    /** @param {Vertex[]} acc } */ function (acc, curr) {
      if (isOdd(curr.edges.length)) acc.push(curr);
      return acc;
    },
    []
  );
}

/**
 * Implements the Floyd-Warshall algorithm to find shortest paths between all pairs of odd vertices.
 * Then uses the shortest path distances to find the minimal-cost pairing.
 *
 * @param {Vertex[]} odd_vertices - The vertices with odd degrees.
 * @returns {[number, number][]} - An array of pairs [vertexId, vertexId] representing the best pairings.
 */
function get_least_cost_odd_pairings(odd_vertices) {
  const n = odd_vertices.length;

  // Initialize distance matrix with Infinity
  const dist = Array.from({ length: n }, () => Array(n).fill(Infinity));
  const next = Array.from({ length: n }, () => Array(n).fill(null));

  // Set up the initial distances based on direct edges between vertices
  for (let i = 0; i < n; i++) {
    dist[i][i] = 0;
    const v1 = odd_vertices[i];
    for (let edge of v1.edges) {
      let v2 = edge.vertex1 === v1 ? edge.vertex2 : edge.vertex1;
      const j = odd_vertices.findIndex((v) => v.id === v2.id);
      if (j !== -1) {
        // Only consider edges between odd-degree vertices
        dist[i][j] = edge.weight;
        dist[j][i] = edge.weight; // Since it's an undirected graph
        next[i][j] = j;
        next[j][i] = i;
      }
    }
  }

  // Floyd-Warshall Algorithm to compute all-pairs shortest paths
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
          next[i][j] = next[i][k];
        }
      }
    }
  }

  // DP solution with bitmasking to find the optimal pairing
  /**
   * @type {number[]}
   * dp[mask] holds the minimum cost for pairing vertices in the set represented by 'mask'
   */
  const dp = Array(1 << n).fill(Infinity);
  dp[0] = 0; // Base case: no vertices paired, cost is 0

  /**
   * @type {Object.<number, [number, number][]>}
   * Map to store the optimal pairings for each mask
   */
  const pairingsMap = {};

  /**
   * Initialize the pairings map for the base case
   * @type {number[]}
   */
  pairingsMap[0] = [];

  // Iterate over all possible masks (subsets of vertices)
  /**
   * @type {number}
   */
  for (let mask = 0; mask < 1 << n; mask++) {
    if (dp[mask] === Infinity) continue; // Skip invalid states

    // Find the first unpaired vertex in the current mask
    /**
     * @type {number}
     */
    let i;
    for (i = 0; i < n; i++) {
      if ((mask & (1 << i)) === 0) break; // i is the first unpaired vertex
    }

    // Try to pair vertex i with another unpaired vertex j
    for (let j = i + 1; j < n; j++) {
      if ((mask & (1 << j)) === 0) {
        // j is also unpaired
        /**
         * @type {number}
         * Create a new mask with i and j paired
         */
        const newMask = mask | (1 << i) | (1 << j);

        /**
         * @type {number}
         * Calculate the new cost
         */
        const newCost = dp[mask] + dist[i][j];

        if (newCost < dp[newMask]) {
          dp[newMask] = newCost;

          /**
           * Update the pairings map with the new pair
           * @type {[number, number][]}
           */
          pairingsMap[newMask] = [
            ...(pairingsMap[mask] || []),
            [odd_vertices[i].id, odd_vertices[j].id],
          ];
        }
      }
    }
  }

  // Return the best pairings for the full mask (all vertices paired)
  /**
   * @type {number}
   * Full mask where all vertices are paired
   */
  const fullMask = (1 << n) - 1;

  return pairingsMap[fullMask] || [];
}
