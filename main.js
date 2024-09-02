import { Edge } from "./graph/Edge.js";
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

  /**
   *
   * @param {Edge[]} path
   * @returns {number}
   */
  const pathWeight = (path) => path.reduce((acc, curr) => acc + curr.weight, 0);

  const paths = [];

  for (let i = 0; i < 10000; i++) {
    const path = traversePath({ startVertex, endVertex, edges });
    const weight = pathWeight(path);

    paths.push({ path, weight });
  }

  paths.sort((a, b) => a.weight - b.weight);

  console.log(paths);
});

/**
 *
 * @param {{startVertex: Vertex, endVertex: Vertex, edges: Edge[], vertices: Vertex[]}} param0
 * @returns
 */
function traversePath({ startVertex, endVertex, edges }) {
  /** @type {Edge[]} */
  const traveledEdges = [];

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

  /**
   *
   * @returns {boolean}
   */
  const allEdgesTraveled = () => edges.every(hasTraveled);

  /**
   *
   * @returns {boolean}
   */
  const isEndVertex = () => currentVertex.id === endVertex.id;

  /**
   *
   * @returns {boolean}
   */
  const routeCompleted = () => allEdgesTraveled() && isEndVertex();

  /**
   *
   * @param {Edge} edge
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
   * @returns {Edge}
   */
  function pickRandomEdge(edges) {
    if (edges.length === 0) return undefined;
    const randomIndex = Math.floor(Math.random() * edges.length);
    return edges[randomIndex];
  }

  while (!routeCompleted()) {
    const options = getOptions(currentVertex);

    const selectedEdge = pickRandomEdge(options);

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
  }

  return traveledEdges;
}
