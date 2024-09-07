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

    console.log(graphHandler);
  } catch (error) {
    console.error(error);
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

  const { inDegree, outDegree } = compute_degress(
    Array.from(vertexMap.values())
  );

  console.log("inDegree", inDegree);
  console.log("outDegree", outDegree);

  const { surplus, deficit } = compute_surplus_deficit(
    inDegree,
    outDegree,
    vertexMap
  );

  const balancingEdges = compute_balancing_edges(surplus, deficit);

  balancingEdges.forEach(({ vertex1, vertex2, direction, shadowId }) => {
    graphHandler.graph.addEdge(vertex1, vertex2, direction, shadowId);
  });
}

/**
 *
 * @param {Vertex[]} vertices
 * @param {number[]} idFilter
 * @returns {{inDegree: Map<number, number>, outDegree: Map<number, number>}}
 */
function compute_degress(vertices, idFilter = []) {
  // Maps to store in-degrees and out-degrees per vertexId
  const inDegree = new Map();
  const outDegree = new Map();

  // Initialize maps with all vertices
  vertices.forEach((v) => {
    inDegree.set(v.id, 0);
    outDegree.set(v.id, 0);
  });

  // Compute in-degrees and out-degrees
  vertices.forEach((vertex) => {
    vertex.edges.forEach((edge) => {
      // Check if the edge can be traveled from the starting vertex
      if (canTravel(edge, vertex.id)) {
        // If travelable from vertex to edge.vertex2, it's an out-going edge
        outDegree.set(vertex.id, outDegree.get(vertex.id) + 1);
      }
      // Check if the edge can be traveled to the vertex
      if (canTravel(edge, vertex.id, true)) {
        // If travelable to vertex from edge.vertex1, it's an incoming edge
        inDegree.set(vertex.id, inDegree.get(vertex.id) + 1);
      }
    });
  });

  vertices.forEach((vertex) => {
    if (inDegree.get(vertex.id) === 0 || outDegree.get(vertex.id) === 0) {
      const error = new Error("Unreachable vertex detected");

      error.cause = { allVerticies: vertices, offendingVertex: vertex };

      throw error;
    }
  });

  return { inDegree, outDegree };
}

/**
 *
 * @param {Map<number, number>} inDegree
 * @param {Map<number, number>} outDegree
 * @param {Map<number, Vertex>} vertexMap
 * @returns {{surplus: Vertex[], deficit: Vertex[]}}
 */
function compute_surplus_deficit(inDegree, outDegree, vertexMap) {
  const unBalanced = compute_unbalanced(inDegree, outDegree);

  /**
   * @type {Vertex[]}
   */
  const surplus = [];
  /**
   * @type {Vertex[]}
   */
  const deficit = [];

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
  return { surplus, deficit };
}

/**
 *
 * @param {Map<number, number>} inDegree
 * @param {Map<number, number>} outDegree
 * @returns {number[][]} Array of all verticies with non 0 diff
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
