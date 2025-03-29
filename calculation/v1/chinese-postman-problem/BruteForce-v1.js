import { Edge } from "../../../graph/Edge.js";
import { Vertex } from "../../../graph/Vertex.js";
import { unwrap } from "../../v2/utils.js";

/**
 *
 * @param {Edge[]} path
 * @returns {number}
 */
const pathWeight = (path) => path.reduce((acc, curr) => acc + curr.weight, 0);

let bestPath = Infinity;

/**
 * Handles incoming messages from the main thread
 */
onmessage = function (event) {
  const { startVertex, endVertex, edges, iterations } = event.data;
  const paths = [];
  const chunkSize = Math.floor(iterations / 100); // Send progress after every 1% of work

  for (let i = 0; i < iterations; i++) {
    const path = traversePath({ startVertex, endVertex, edges });
    if (!path) continue;
    const weight = pathWeight(path);
    bestPath = weight;

    paths.push({ path, weight });

    // Send progress update
    if (i % chunkSize === 0) {
      const progress = Math.floor((i / iterations) * 100);
      postMessage({ progress, type: "progress" });
    }
  }

  // Send the sorted paths back to the main thread
  postMessage({ paths, type: "done" });
};

/**
 *
 * @param {{startVertex: Vertex, endVertex: Vertex, edges: Edge[], vertices: Vertex[]}} param0
 * @returns
 */
function traversePath({ startVertex, endVertex, edges }) {
  /**
   * @type {Edge[]}
   */
  const traveledEdges = [];
  let currentWeight = 0;
  let currentVertex = startVertex;

  /**
   *
   * @param {Edge} edge
   * @returns {boolean}
   */
  const hasTraveled = (edge) =>
    traveledEdges.findIndex(
      (traveled) =>
        traveled.vertex1.id === edge.vertex1.id &&
        traveled.vertex2.id === edge.vertex2.id
    ) !== -1;

  const allEdgesTraveled = () => edges.every(hasTraveled);

  const isEndVertex = () => currentVertex.id === endVertex.id;

  const routeCompleted = () => allEdgesTraveled() && isEndVertex();

  /**
   *
   * @param {Edge} edge
   * @param {number} vertexId
   * @returns {boolean}
   */
  const canTravel = (edge, vertexId) =>
    edge.direction === "any" ||
    (edge.direction === "from" && edge.vertex1.id === vertexId) ||
    (edge.direction === "to" && edge.vertex2.id === vertexId);

  /**
   *
   * @param {Vertex} vertex
   * @returns {Edge[]}
   */
  const getOptions = (vertex) =>
    vertex.edges.filter((edge) => canTravel(edge, vertex.id));

  /**
   *
   * @param {Edge[]} edges
   * @returns {Edge | undefined}
   */
  function pickRandomEdge(edges) {
    if (edges.length === 0) return undefined;
    const randomIndex = Math.floor(Math.random() * edges.length);
    return edges[randomIndex];
  }

  while (!routeCompleted()) {
    if (currentWeight > bestPath) return false;

    const options = getOptions(currentVertex);
    const selectedEdge = unwrap(pickRandomEdge(options));

    if (!selectedEdge)
      console.error(
        "no edge selected from options:",
        options,
        "and from current vertex:",
        currentVertex
      );

    const nextVertex =
      selectedEdge.vertex1.id !== currentVertex.id
        ? selectedEdge.vertex1
        : selectedEdge.vertex2;

    currentVertex = nextVertex;
    traveledEdges.push(selectedEdge);
    currentWeight += selectedEdge.weight;
  }

  return traveledEdges;
}
