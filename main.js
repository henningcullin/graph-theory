import {
  ccp_brute_v1,
  ccp_dijkstra_v1,
  ccp_exhaustive_v1,
  sp_dijkstra_v1,
} from "./calculation/v1/WorkerScripts.js";
import { get_flood_filled } from "./calculation/v2/flood_fill.js";
import { canTravel, unreachable, unwrap } from "./calculation/v2/utils.js";
import { Edge } from "./graph/Edge.js";
import { GraphHandler } from "./graph/GraphHandler.js";
import { domLoaded } from "./graph/utils.js";
import { Vertex } from "./graph/Vertex.js";
import { dijkstra } from "./v2/dijkstra.js";

await domLoaded();

const graphHandler = new GraphHandler("graphCanvas");

document.getElementById("calculateRoute")?.addEventListener("click", () => {
  const [startId, endId] =
    prompt(
      "Enter the start id and end id. They should be separated by a comma"
    )?.split(",") ?? [];

  const { vertices, edges } = graphHandler.graph;

  const [startVertex, endVertex] = [
    vertices.find((vertex) => vertex.id === parseInt(startId)),
    vertices.find((vertex) => vertex.id === parseInt(endId)),
  ];

  if (!(startVertex instanceof Vertex) || !(endVertex instanceof Vertex))
    return console.error("start or end vertex was undefined");

  solve_chinese_postman_problem(startVertex, endVertex, graphHandler);

  const methods = {
    "ccp-dijkstra-1": () => ccp_dijkstra_v1(startVertex, endVertex, edges),
    "ccp-brute-1": () => ccp_brute_v1(startVertex, endVertex, edges),
    "ccp-exhaustive-1": () => ccp_exhaustive_v1(startVertex, endVertex, edges),
    "sp-dijkstra-1": () => sp_dijkstra_v1(startVertex, endVertex, edges),
  };

  const methodGroup = document.getElementById("calculationMethod");

  const method = methodGroup?.hasAttribute("value")
    ? methodGroup.getAttribute("value") ?? ""
    : "";
});

/**
 *
 * @param {Vertex} startVertex
 * @param {Vertex} endVertex
 * @param {GraphHandler} graphHandler
 */
function solve_chinese_postman_problem(startVertex, endVertex, graphHandler) {
  try {
    build_eulerian_graph(startVertex, endVertex, graphHandler);

    const shortestPath = follow_eulerian_path(
      startVertex,
      endVertex,
      graphHandler.graph.edges
    );

    console.log(shortestPath);
  } catch (error) {
    console.error(error);
  }
}

/**
 *
 * @param {Edge[]} edges
 * @param {Vertex} startVertex
 * @param {Vertex} endVertex
 */
function follow_eulerian_path(startVertex, endVertex, edges) {
  /**
   * @type {Edge[][]}
   */
  const paths = [];

  recursive_traversal(startVertex, endVertex, edges, []);

  return paths;

  /**
   *
   * @param {Vertex} currentVertex
   * @param {Vertex} endVertex
   * @param {Edge[]} edges
   * @param {Edge[]} visitedEdges
   */
  function recursive_traversal(currentVertex, endVertex, edges, visitedEdges) {
    if (paths?.length > 10) return;

    /**
     * @param {Edge} edge
     * @returns {boolean}
     */
    const hasTraveled = (edge) =>
      visitedEdges.findIndex(
        (traveled) =>
          traveled.vertex1.id === edge.vertex1.id &&
          traveled.vertex2.id === edge.vertex2.id
      ) !== -1;

    const allEdgesTraveled = () => edges.every(hasTraveled);

    const isEndVertex = () => currentVertex.id === endVertex.id;

    const pathCompleted = () => allEdgesTraveled() && isEndVertex();

    /**
     *
     * @param {Edge} edge
     * @param {number} vertexId
     * @returns {boolean}
     */
    const canTravel = (edge, vertexId) =>
      visitedEdges.findIndex((visitedEdge) => visitedEdge.id === edge.id) ===
        -1 &&
      (edge.direction === "any" ||
        (edge.direction === "from" && edge.vertex1.id === vertexId) ||
        (edge.direction === "to" && edge.vertex2.id === vertexId));

    /**
     *
     * @param {Vertex} vertex
     * @returns {Edge[]}
     */
    const getOptions = (vertex) =>
      vertex.edges
        .filter((edge) => canTravel(edge, vertex.id))
        .sort((a, b) => a.weight - b.weight); // Sort edges by weight

    if (pathCompleted()) return paths.push(visitedEdges);

    const options = getOptions(currentVertex);

    options.forEach((edge) => {
      const nextVertex =
        edge.vertex1.id !== currentVertex.id ? edge.vertex1 : edge.vertex2;

      recursive_traversal(
        nextVertex,
        endVertex,
        edges,
        [...visitedEdges, edge] // Use spread operator to avoid creating new arrays unnecessarily
      );
    });
  }
}

/**
 *
 * @param {Vertex} startVertex
 * @param {Vertex} endVertex
 * @param {GraphHandler} graphHandler
 */
function build_eulerian_graph(startVertex, endVertex, graphHandler) {
  const [vertexMap, edgeMap] = get_flood_filled(startVertex, endVertex);

  if (vertexMap.size < 2 || edgeMap.size < 1)
    throw new Error("You don't need to calculate this!!");

  remove_unreachable(vertexMap, edgeMap, graphHandler);

  const { inDegrees, outDegrees } = compute_in_out_degrees(
    Array.from(vertexMap.values())
  );

  console.log("Before balancing");
  console.log("inDegree", inDegrees);
  console.log("outDegree", outDegrees);

  const { surplus, deficit } = compute_surplus_deficit(
    inDegrees,
    outDegrees,
    vertexMap,
    startVertex,
    endVertex
  );

  const balancingEdges = compute_balancing_edges(surplus, deficit);

  balancingEdges.forEach(({ vertex1, vertex2, direction, shadowId }) => {
    graphHandler.graph.addEdge(vertex1, vertex2, direction, shadowId);
  });

  const degrees = compute_degrees(
    graphHandler.graph.vertices,
    startVertex,
    endVertex
  );

  const finalEdges = compute_final_edges(degrees, vertexMap);

  finalEdges.forEach(({ vertex1, vertex2, direction, shadowId }) => {
    graphHandler.graph.addEdge(vertex1, vertex2, direction, shadowId);
  });
}

/**
 *
 * @param {Map<number, Vertex>} vertexMap
 * @param {Map<number, Edge>} edgeMap
 * @param {GraphHandler} graphHandler
 */
function remove_unreachable(vertexMap, edgeMap, graphHandler) {
  graphHandler.graph.edges = graphHandler.graph.edges.filter((edge) =>
    edgeMap.has(edge.id)
  );
  graphHandler.graph.vertices = graphHandler.graph.vertices.filter((vertex) =>
    vertexMap.has(vertex.id)
  );
}

/**
 *  @param {Map<number, number>} degrees
 *  @param {Map<number, Vertex>} vertexMap
 *  @returns {{vertex1: Vertex, vertex2: Vertex, direction: import('./graph/Edge.js').Direction, shadowId: number}[]}
 */
function compute_final_edges(degrees, vertexMap) {
  /**
   * @type {{path: Edge[], startVertex: Vertex}[]}
   */
  const bestPairings = [];

  // 1. Find all vertices with odd degrees
  /**
   * @type {Vertex[]}
   */
  const oddDegreeVertices = [];
  degrees.forEach((degree, vertexId) => {
    if (degree % 2 !== 0) {
      oddDegreeVertices.push(unwrap(vertexMap.get(vertexId)));
    }
  });

  // 2. Generate all possible pairings of odd-degree vertices
  const allPairings = generatePairings(oddDegreeVertices);

  let minWeight = Infinity;
  /**
   * @type {{path: Edge[], startVertex: Vertex}[]}
   */
  let bestPathSet = [];

  // 3. Try all combinations of pairings and find the minimum cost set
  for (const pairing of allPairings) {
    let totalWeight = 0;
    const currentPaths = [];

    for (const [vertex1, vertex2] of pairing) {
      // Run Dijkstra between vertex1 and vertex2
      const pathResult = dijkstra(vertex1, vertex2);
      if (pathResult === null) {
        totalWeight = Infinity;
        break;
      }

      // Accumulate the weight and store the path
      totalWeight += pathResult.weight;
      currentPaths.push({ path: pathResult.path, startVertex: vertex1 });
    }

    // If this pairing has the minimum weight, update the bestPathSet
    if (totalWeight < minWeight) {
      minWeight = totalWeight;
      bestPathSet = currentPaths;
    }
  }

  // 4. Store the best path set in bestPairings
  bestPathSet.forEach((path) => {
    bestPairings.push(path);
  });

  // 5. Return the result wrapped in correct_final_edges function
  return correct_final_edges(bestPairings);
}

/**
 * Helper function to generate all possible pairings of vertices.
 * This generates all valid pairings of vertices that can be paired up.
 *
 * @param {Vertex[]} vertices - An array of odd-degree vertices.
 * @returns {[Vertex, Vertex][][]} - Array of possible pairings.
 */
function generatePairings(vertices) {
  const pairings = [];

  function backtrack(pairs, remaining) {
    if (remaining.length === 0) {
      pairings.push([...pairs]);
      return;
    }

    // Take the first vertex and try pairing it with all other remaining vertices
    const vertex1 = remaining[0];
    for (let i = 1; i < remaining.length; i++) {
      const vertex2 = remaining[i];
      const newRemaining = remaining.filter(
        (v) => v !== vertex1 && v !== vertex2
      );
      pairs.push([vertex1, vertex2]);
      backtrack(pairs, newRemaining);
      pairs.pop(); // backtrack
    }
  }

  backtrack([], vertices);
  return pairings;
}

/**
 *
 * @param {{path: Edge[], startVertex: Vertex}[]} bestPairings
 * @returns {{vertex1: Vertex, vertex2: Vertex, direction: import('./graph/Edge.js').Direction, shadowId: number}[]}
 */
function correct_final_edges(bestPairings) {
  /**
   * @type {{direction: import('./graph/Edge.js').Direction, shadowId: number, vertex1: Vertex, vertex2: Vertex}[]}
   */
  const correctingEdges = [];

  for (const pathObject of bestPairings) {
    const { path, startVertex } = pathObject;

    let currentVertex = startVertex;

    path.forEach((edge) => {
      const oppositeVertex =
        edge.vertex1.id === currentVertex.id ? edge.vertex2 : edge.vertex1;

      correctingEdges.push({
        direction: "from",
        shadowId: edge.id,
        vertex1: currentVertex,
        vertex2: oppositeVertex,
      });

      currentVertex = oppositeVertex;
    });
  }

  return correctingEdges;
}

/**
 *
 * @param {Vertex[]} vertices
 * @returns {{inDegrees: Map<number, number>, outDegrees: Map<number, number>}}
 */
function compute_in_out_degrees(vertices) {
  // Maps to store in-degrees and out-degrees per vertexId
  const inDegrees = new Map();
  const outDegrees = new Map();

  // Initialize maps with all vertices
  vertices.forEach((v) => {
    inDegrees.set(v.id, 0);
    outDegrees.set(v.id, 0);
  });

  // Compute in-degrees and out-degrees
  vertices.forEach((vertex) => {
    vertex.edges.forEach((edge) => {
      if (!edge.isDirected) return;
      // Check if the edge can be traveled from the starting vertex
      if (canTravel(edge, vertex.id)) {
        // If travelable from vertex to edge.vertex2, it's an out-going edge
        outDegrees.set(vertex.id, outDegrees.get(vertex.id) + 1);
      }
      // Check if the edge can be traveled to the vertex
      if (canTravel(edge, vertex.id, true)) {
        // If travelable to vertex from edge.vertex1, it's an incoming edge
        inDegrees.set(vertex.id, inDegrees.get(vertex.id) + 1);
      }
    });
  });

  vertices.forEach((vertex) => {
    const inDegree = inDegrees.get(vertex.id);
    const outDegree = outDegrees.get(vertex.id);

    if (inDegree - outDegree !== 0) {
      vertex.edges.forEach((edge) => {
        if (edge.isDirected()) return;
        if (inDegrees.get(vertex.id) > outDegrees.get(vertex.id)) {
          outDegrees.set(vertex.id, outDegrees.get(vertex.id) + 1);
        } else if (outDegrees.get(vertex.id) > inDegrees.get(vertex.id)) {
          inDegrees.set(vertex.id, inDegrees.get(vertex.id) + 1);
        }
      });
    }
  });

  return { inDegrees, outDegrees };
}

/**
 *
 * @param {Vertex[]} vertices
 * @param {Vertex} startVertex
 * @param {Vertex} endVertex
 * @returns {Map<number, number>}
 */
function compute_degrees(vertices, startVertex, endVertex) {
  const degrees = new Map();

  vertices.forEach((vertex) => {
    if (vertex.id === startVertex.id || vertex.id === endVertex.id) return;

    degrees.set(vertex.id, vertex.edges.length);
  });

  return degrees;
}

/**
 *
 * @param {*} item
 * @returns {any[]}
 */
function toClone(item) {
  const clone = [...item];
  return clone;
}

/**
 *
 * @param {Map<number, number>} inDegrees
 * @param {Map<number, number>} outDegrees
 * @param {Map<number, Vertex>} vertexMap
 * @param {Vertex} startVertex
 * @param {Vertex} endVertex
 * @returns {{surplus: Vertex[], deficit: Vertex[]}}
 */
function compute_surplus_deficit(
  inDegrees,
  outDegrees,
  vertexMap,
  startVertex,
  endVertex
) {
  const unBalanced = compute_unbalanced(inDegrees, outDegrees);

  let hasFixedStart = false;
  let hasFixedEnd = false;

  /**
   * @type {Vertex[]}
   */
  const surplus = [];
  /**
   * @type {Vertex[]}
   */
  const deficit = [];

  console.log("initial unbalanced", toClone(unBalanced));

  unBalanced.forEach(([vertexId, degreeInbalance], index) => {
    if (vertexId === startVertex.id) {
      // Make endvertex have deficit one 1
      hasFixedStart = true;
      /* if (degreeInbalance === -1) {
        // If already deficit of 1, do nothing
      } else */ if (degreeInbalance < 0) {
        for (let i = 0; i < 1 * -(degreeInbalance + 1); i++) {
          surplus.push(startVertex);
        }
      } else {
        for (let i = 0; i < 1 * (degreeInbalance + 1); i++) {
          surplus.push(startVertex);
        }
      }
      unBalanced.splice(index, 1);
    } else if (vertexId === endVertex.id) {
      hasFixedEnd = true;
      // Make endvertex have deficit one 1
      /* if (degreeInbalance === 1) {
      } else */ if (degreeInbalance > 0) {
        for (let i = 0; i < 1 * degreeInbalance - 1; i++) {
          deficit.unshift(endVertex);
        }
      } else {
        for (let i = 0; i < 1 * -(degreeInbalance - 1); i++) {
          deficit.unshift(endVertex);
        }
      }
      unBalanced.splice(index, 1);
    }
  });

  console.log("after start end trim", toClone(unBalanced));

  console.log("1/3 surplus", toClone(surplus));
  console.log("1/3 deficit", toClone(deficit));

  unBalanced.forEach(([vertexId, degreeInbalance]) => {
    if (degreeInbalance > 0) {
      for (let i = 0; i < 1 * degreeInbalance; i++) {
        surplus.push(unwrap(vertexMap.get(vertexId)));
      }
    } else if (degreeInbalance < 0) {
      for (let i = 0; i < 1 * -degreeInbalance; i++) {
        deficit.push(unwrap(vertexMap.get(vertexId)));
      }
    } else unreachable();
  });

  console.log("2/3 surplus", toClone(surplus));
  console.log("2/3 deficit", toClone(deficit));

  if (!hasFixedStart) {
    surplus.push(startVertex);
    // If start vertex is balanced, add to surplus to make 1 extra out
  }
  if (!hasFixedEnd) {
    // If end vertex is balanced add to deficit to make 1 extra in
    deficit.unshift(endVertex);
  }

  console.log("3/3 surplus", toClone(surplus));
  console.log("3/3 deficit", toClone(deficit));

  return { surplus, deficit };
}

/**
 *
 * @param {Map<number, number>} inDegree
 * @param {Map<number, number>} outDegree
 * @returns {number[][]} Array of all vertices with non 0 diff
 *
 * The first first element is the vertexId
 *
 * The second element is the difference in degress from inDegree-outDegree
 */
function compute_unbalanced(inDegree, outDegree) {
  return Array.from(inDegree.entries())
    .map(([vertexId, inDegree]) => {
      const diffDegrees = inDegree - unwrap(outDegree.get(vertexId));
      if (diffDegrees !== 0) {
        return [vertexId, diffDegrees];
      }
    })
    .filter((item) => typeof item !== "undefined");
}

/**
 *
 * @param {Vertex[]} surplus
 * @param {Vertex[]} deficit
 */
function compute_balancing_edges(surplus, deficit) {
  /**
   * @type {{path: Edge[], weight: number, startVertex: Vertex}[]}
   */
  const balancingPaths = [];

  // Iterate through surplus and deficit vertices and add virtual edges
  while (surplus.length && deficit.length) {
    const surplusVertex = unwrap(surplus.pop()); // Take a surplus vertex
    const deficitVertex = unwrap(deficit.pop()); // Take a deficit vertex

    const path = dijkstra(surplusVertex, deficitVertex);

    const balanceItem = { ...unwrap(path), startVertex: surplusVertex };

    balancingPaths.push(balanceItem);
  }

  return correct_balancing_edges(balancingPaths);
}

/**
 * @param {{path: Edge[], weight: number, startVertex: Vertex}[]} balancingPaths
 */
function correct_balancing_edges(balancingPaths) {
  /**
   * @type {{direction: import('./graph/Edge.js').Direction, shadowId: number, vertex1: Vertex, vertex2: Vertex}[]}
   */
  const correctingEdges = [];

  for (const pathObject of balancingPaths) {
    const { path, startVertex } = pathObject;

    let currentVertex = startVertex;

    path.forEach((edge) => {
      const oppositeVertex =
        edge.vertex1.id === currentVertex.id ? edge.vertex2 : edge.vertex1;

      correctingEdges.push({
        direction: "from",
        shadowId: edge.id,
        vertex1: currentVertex,
        vertex2: oppositeVertex,
      });

      currentVertex = oppositeVertex;
    });
  }

  return correctingEdges;
}
