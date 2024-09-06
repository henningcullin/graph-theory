import {
  ccp_brute_v1,
  ccp_dijkstra_v1,
  ccp_exhaustive_v1,
  sp_dijkstra_v1,
} from "./calculation/v1/WorkerScripts.js";
import { get_flood_filled } from "./calculation/v2/flood_fill.js";
import { canTravel } from "./calculation/v2/utils.js";
import { GraphHandler } from "./graph/GraphHandler.js";
import { domLoaded } from "./graph/utils.js";
import { Vertex } from "./graph/Vertex.js";

await domLoaded();

const graphHandler = new GraphHandler("graphCanvas");

document.getElementById("calculateRoute").addEventListener("click", () => {
  const [startId, endId] = prompt(
    "Enter the start id and end id. They should be separated by a comma"
  ).split(",");

  const { vertices, edges } = graphHandler.graph;

  const [startVertex, endVertex] = [
    vertices.find((vertex) => vertex.id === parseInt(startId)),
    vertices.find((vertex) => vertex.id === parseInt(endId)),
  ];

  solve_chinese_postman_problem(startVertex, endVertex);

  return;

  const methods = {
    "ccp-dijkstra-1": () => ccp_dijkstra_v1(startVertex, endVertex, edges),
    "ccp-brute-1": () => ccp_brute_v1(startVertex, endVertex, edges),
    "ccp-exhaustive-1": () => ccp_exhaustive_v1(startVertex, endVertex, edges),
    "sp-dijkstra-1": () => sp_dijkstra_v1(startVertex, endVertex, edges),
  };

  const method = document.getElementById("calculationMethod").value;

  methods[method]();
});

function solve_chinese_postman_problem(startVertex, endVertex) {
  try {
    const eulearianGraph = build_eulerian_graph(startVertex, endVertex);
  } catch (error) {
    console.error(error);
  }
}

function build_eulerian_graph(startVertex, endVertex) {
  const [vertexMap, edgeMap] = get_flood_filled(startVertex, endVertex);

  if (vertexMap.size < 2 || edgeMap.size < 1)
    throw new Error("You don't need to calculate this!!");

  const { inDegree, outDegree } = compute_degress(
    Array.from(vertexMap.values())
  );

  console.log("inDegree", inDegree);
  console.log("outDegree", outDegree);

  const imbalanced_verticies = get_imbalanced_verticies(inDegree, outDegree);

  console.log(imbalanced_verticies);

  if (imbalanced_verticies.length === 0) {
    console.log("The graph is already Eulerian.");
  }
}

/**
 *
 * @param {Vertex[]} vertices
 * @returns {{inDegree: Map<number, number>, outDegree: Map<number, number>}}
 */
function compute_degress(vertices) {
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

  return { inDegree, outDegree };
}

/**
 *
 * @param {Map<number, number>} inDegree
 * @param {Map<number, number>} outDegree
 * @returns
 */
function get_imbalanced_verticies(inDegree, outDegree) {
  const imbalancedVertices = [];

  inDegree.forEach((deg, vertexId) => {
    const outDeg = outDegree.get(vertexId);
    if (deg !== outDeg) {
      imbalancedVertices.push({
        vertexId,
        imbalance: outDeg - deg,
      });
    }
  });

  return imbalancedVertices;
}
