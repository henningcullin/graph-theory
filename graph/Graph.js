import { Vertex } from "./Vertex.js";
import { Edge } from "./Edge.js";
import { PriorityQueue } from "./utils.js";

/**
 * Represents the graph, including vertices and edges.
 */
export class Graph {
  /**
   * @param {string} canvasId - The ID of the canvas element where the graph is drawn.
   */
  constructor(canvasId) {
    /** @type {Vertex[]} */
    this.vertices = [];
    /** @type {Edge[]} */
    this.edges = [];
    /** @type {HTMLCanvasElement} */
    this.canvas = document.getElementById(canvasId);
    /** @type {CanvasRenderingContext2D} */
    this.ctx = this.canvas.getContext("2d");
  }

  /**
   * Adds a vertex to the graph.
   * @param {number} x - The x-coordinate of the vertex.
   * @param {number} y - The y-coordinate of the vertex.
   * @param {string} label - The label of the vertex.
   * @returns {Vertex} - The created vertex.
   */
  addVertex(x, y, label) {
    const vertex = new Vertex(x, y, label);
    this.vertices.push(vertex);
    return vertex;
  }

  /**
   * Adds an edge between two vertices.
   * @param {Vertex} vertex1 - The starting vertex of the edge.
   * @param {Vertex} vertex2 - The ending vertex of the edge.
   * @param {Direction} [direction='any'] - The direction of the edge.
   */
  addEdge(vertex1, vertex2, direction = "any") {
    const edge = new Edge(vertex1, vertex2, direction);
    this.edges.push(edge);
  }

  /**
   * Draws the graph on the canvas.
   */
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.edges.forEach((edge) => edge.draw(this.ctx));
    this.vertices.forEach((vertex) => vertex.draw(this.ctx));
  }

  /**
   * Calculates the cost of the Chinese Postman Problem.
   * @returns {number} The cost of the minimum route covering all edges.
   */
  calculateChinesePostmanProblem() {
    // Step 1: Check if the graph is Eulerian
    if (this.isEulerian()) {
      return this.calculateEulerianCircuitCost();
    }

    // Step 2: Find vertices with odd degrees
    const oddVertices = this.getOddDegreeVertices();

    // Step 3: Find shortest paths between odd degree vertices
    const shortestPaths = this.calculateShortestPaths(oddVertices);

    // Step 4: Pair odd degree vertices with minimum cost
    const minCost = this.findMinimumCostPairing(oddVertices, shortestPaths);

    // Step 5: Return the total cost (original edges cost + minimum cost to add edges)
    return this.calculateOriginalEdgesCost() + minCost;
  }

  /**
   * Checks if the graph is Eulerian (either Eulerian Path or Circuit).
   * @returns {boolean} True if the graph is Eulerian, otherwise false.
   */
  isEulerian() {
    // Check the degree conditions for Eulerian Path or Circuit
    const inDegrees = new Map();
    const outDegrees = new Map();

    this.edges.forEach((edge) => {
      outDegrees.set(edge.vertex1, (outDegrees.get(edge.vertex1) || 0) + 1);
      inDegrees.set(edge.vertex2, (inDegrees.get(edge.vertex2) || 0) + 1);
    });

    const oddIn = [];
    const oddOut = [];

    this.vertices.forEach((vertex) => {
      const outDegree = outDegrees.get(vertex) || 0;
      const inDegree = inDegrees.get(vertex) || 0;

      if (outDegree !== inDegree) {
        if (outDegree > inDegree) oddOut.push(vertex);
        if (inDegree > outDegree) oddIn.push(vertex);
      }
    });

    return (
      (oddIn.length === 0 && oddOut.length === 0) ||
      (oddIn.length === 2 && oddOut.length === 2)
    );
  }

  /**
   * Finds the vertices with odd degrees.
   * @returns {Vertex[]} An array of vertices with odd degrees.
   */
  getOddDegreeVertices() {
    const oddVertices = [];
    const inDegrees = new Map();
    const outDegrees = new Map();

    this.edges.forEach((edge) => {
      outDegrees.set(edge.vertex1, (outDegrees.get(edge.vertex1) || 0) + 1);
      inDegrees.set(edge.vertex2, (inDegrees.get(edge.vertex2) || 0) + 1);
    });

    this.vertices.forEach((vertex) => {
      const outDegree = outDegrees.get(vertex) || 0;
      const inDegree = inDegrees.get(vertex) || 0;

      if (outDegree !== inDegree) {
        oddVertices.push(vertex);
      }
    });

    return oddVertices;
  }

  /**
   * Calculates shortest paths between all pairs of vertices.
   * @param {Vertex[]} vertices - An array of vertices to calculate shortest paths between.
   * @returns {Map<Vertex, Map<Vertex, number>>} A map of shortest paths between vertices.
   */
  calculateShortestPaths(vertices) {
    const shortestPaths = new Map();

    vertices.forEach((v1) => {
      const distances = this.dijkstra(v1);
      shortestPaths.set(v1, distances);
    });

    return shortestPaths;
  }

  /**
   * Dijkstra's algorithm to find shortest paths from a vertex.
   * @param {Vertex} start - The starting vertex for the algorithm.
   * @returns {Map<Vertex, number>} A map of shortest distances from the start vertex.
   */
  dijkstra(start) {
    const distances = new Map();
    const priorityQueue = new PriorityQueue();
    const visited = new Set();

    this.vertices.forEach((vertex) => {
      distances.set(vertex, Infinity);
    });
    distances.set(start, 0);
    priorityQueue.enqueue(start, 0);

    while (!priorityQueue.isEmpty()) {
      const { element: currentVertex } = priorityQueue.dequeue();
      if (visited.has(currentVertex)) continue;
      visited.add(currentVertex);

      this.edges
        .filter((edge) => edge.vertex1 === currentVertex)
        .forEach((edge) => {
          const neighbor = edge.vertex2;
          const newDist = distances.get(currentVertex) + 1; // Assuming unit weight
          if (newDist < distances.get(neighbor)) {
            distances.set(neighbor, newDist);
            priorityQueue.enqueue(neighbor, newDist);
          }
        });
    }

    return distances;
  }

  /**
   * Finds the minimum cost of adding edges to make the graph Eulerian.
   * @param {Vertex[]} oddVertices - An array of vertices with odd degrees.
   * @param {Map<Vertex, Map<Vertex, number>>} shortestPaths - Shortest paths between odd vertices.
   * @returns {number} The minimum cost to add edges.
   */
  findMinimumCostPairing(oddVertices, shortestPaths) {
    // This is a combinatorial optimization problem that can be solved using algorithms like
    // Minimum Weight Perfect Matching. Implementing this algorithm requires advanced techniques,
    // so this is a placeholder for such an algorithm.
    // For simplicity, assume we have a function `calculateMinCostPairing` that does this.
    return this.calculateMinCostPairing(oddVertices, shortestPaths);
  }

  /**
   * Calculates the minimum cost pairing of odd-degree vertices using a heuristic approach.
   * @param {Vertex[]} oddVertices - An array of vertices with odd degrees.
   * @param {Map<Vertex, Map<Vertex, number>>} shortestPaths - Shortest paths between odd vertices.
   * @returns {number} The minimum cost to add edges.
   */
  calculateMinCostPairing(oddVertices, shortestPaths) {
    const n = oddVertices.length;

    if (n % 2 !== 0) {
      throw new Error("Number of odd-degree vertices must be even.");
    }

    // Create a cost matrix for the pairings
    const costMatrix = Array.from({ length: n }, () => Array(n).fill(Infinity));

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const v1 = oddVertices[i];
        const v2 = oddVertices[j];
        costMatrix[i][j] = costMatrix[j][i] =
          shortestPaths.get(v1)?.get(v2) || Infinity;
      }
    }

    // Helper function to calculate the cost of a perfect matching
    function findMinCostMatching(costs) {
      const numVertices = costs.length;
      const dp = Array(1 << numVertices).fill(Infinity);
      dp[0] = 0;

      for (let mask = 0; mask < 1 << numVertices; mask++) {
        let first = -1;
        for (let i = 0; i < numVertices; i++) {
          if (!(mask & (1 << i))) {
            if (first === -1) {
              first = i;
            } else {
              dp[mask | (1 << first) | (1 << i)] = Math.min(
                dp[mask | (1 << first) | (1 << i)],
                dp[mask] + costs[first][i]
              );
            }
          }
        }
      }
      return dp[(1 << numVertices) - 1];
    }

    return findMinCostMatching(costMatrix);
  }

  /**
   * Calculates the cost and path of the Chinese Postman Problem.
   * @returns {Object} An object containing the path and its cost.
   */
  calculateChinesePostmanProblem() {
    // Step 1: Check if the graph is Eulerian
    if (this.isEulerian()) {
      return {
        path: this.calculateEulerianCircuitPath(),
        cost: this.calculateEulerianCircuitCost(),
      };
    }

    // Step 2: Find vertices with odd degrees
    const oddVertices = this.getOddDegreeVertices();

    // Step 3: Find shortest paths between odd degree vertices
    const shortestPaths = this.calculateShortestPaths(oddVertices);

    // Step 4: Pair odd degree vertices with minimum cost
    const minCost = this.findMinimumCostPairing(oddVertices, shortestPaths);

    // Step 5: Calculate the Eulerian path that includes the additional edges
    const eulerianPath = this.calculateCPPPath(oddVertices, shortestPaths);

    // Return the path and total cost (original edges cost + minimum cost to add edges)
    return {
      path: eulerianPath,
      cost: this.calculateOriginalEdgesCost() + minCost,
    };
  }

  /**
   * Calculates the cost of the original edges in the graph.
   * @returns {number} The cost of the original edges.
   */
  calculateOriginalEdgesCost() {
    // Sum up the weights of all edges
    return this.edges.reduce((totalCost, edge) => totalCost + edge.weight, 0);
  }

  /**
   * Calculates the Eulerian path with additional edges.
   * @param {Vertex[]} oddVertices - An array of vertices with odd degrees.
   * @param {Map<Vertex, Map<Vertex, number>>} shortestPaths - Shortest paths between odd vertices.
   * @returns {Edge[]} The Eulerian path including added edges.
   */
  calculateCPPPath(oddVertices, shortestPaths) {
    const eulerianPath = [];

    // Add existing edges
    this.edges.forEach((edge) => eulerianPath.push(edge));

    // Add the minimum cost pairing edges
    // This is a simplified approach assuming we know the added edges; otherwise, this would require more complex logic
    const addedEdges = this.getMinimumCostPairingEdges(
      oddVertices,
      shortestPaths
    );
    addedEdges.forEach((edge) => eulerianPath.push(edge));

    return eulerianPath;
  }

  /**
   * Get the additional edges to add to achieve the minimum cost pairing.
   * @param {Vertex[]} oddVertices - An array of vertices with odd degrees.
   * @param {Map<Vertex, Map<Vertex, number>>} shortestPaths - Shortest paths between odd vertices.
   * @returns {Edge[]} The edges to be added for minimum cost pairing.
   */
  getMinimumCostPairingEdges(oddVertices, shortestPaths) {
    // This is a placeholder function. The actual implementation would need to return the edges added.
    // For now, returning an empty array.
    return [];
  }

  /**
   * Calculates the path for an Eulerian circuit if the graph is Eulerian.
   * @returns {Edge[]} An array of edges representing the Eulerian circuit.
   * @throws {Error} Throws an error if the graph is not Eulerian.
   */
  calculateEulerianCircuitPath() {
    if (!this.isEulerian()) {
      throw new Error("Graph is not Eulerian");
    }

    const path = [];
    // To find the Eulerian circuit, we need a specific algorithm. This is a simplified approach:
    // Here, we would have Hierholzer's algorithm or any other algorithm to get the Eulerian Circuit.
    // For simplicity, just returning the list of edges as the path.

    return this.edges;
  }

  /**
   * Calculates the cost of an Eulerian circuit if the graph is Eulerian.
   * @returns {number} - The total cost of the Eulerian circuit.
   * @throws {Error} - Throws an error if the graph is not Eulerian.
   */
  calculateEulerianCircuitCost() {
    if (!this.isEulerian()) {
      throw new Error("Graph is not Eulerian");
    }

    // Initialize total cost
    let totalCost = 0;

    // To find the Eulerian circuit, we can use Hierholzer's algorithm.
    // However, for simplicity, we will just sum the weights of the edges in this implementation.

    // As we need a valid Eulerian circuit, assume that the graph is Eulerian and contains one circuit.
    // Get the first vertex (arbitrary choice)
    const startVertex = this.vertices[0];

    // Create a map to track edge usage
    const usedEdges = new Set();

    // Function to visit the edges and accumulate the cost
    const visitEdges = (vertex) => {
      // Visit all edges from the current vertex
      this.edges.forEach((edge) => {
        if (
          (edge.vertex1 === vertex || edge.vertex2 === vertex) &&
          !usedEdges.has(edge)
        ) {
          // Mark the edge as used
          usedEdges.add(edge);
          // Add the weight of the edge to the total cost
          totalCost += edge.weight;

          // Move to the next vertex and continue
          const nextVertex =
            edge.vertex1 === vertex ? edge.vertex2 : edge.vertex1;
          visitEdges(nextVertex);
        }
      });
    };

    // Start visiting edges from the start vertex
    visitEdges(startVertex);

    return totalCost;
  }
}
