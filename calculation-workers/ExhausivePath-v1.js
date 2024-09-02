const paths = [];
const MAX_RECURSION_LIMIT = 16;

onmessage = function (event) {
  const { startVertex, endVertex, edges } = event.data;

  recursivelyTraversePath(startVertex, endVertex, edges, [], 0);

  // Send the sorted paths back to the main thread
  postMessage({ paths: paths, type: "done" });
};

const pathWeight = (path) => path.reduce((acc, curr) => acc + curr.weight, 0);

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

function recursivelyTraversePath(
  currentVertex,
  endVertex,
  edges,
  pathCarry,
  depth
) {
  if (depth > MAX_RECURSION_LIMIT) return;

  const hasTraveled = (edge) =>
    pathCarry.findIndex(
      (traveled) =>
        traveled.vertex1.id === edge.vertex1.id &&
        traveled.vertex2.id === edge.vertex2.id
    ) !== -1;

  const allEdgesTraveled = () => edges.every(hasTraveled);

  const isEndVertex = () => currentVertex.id === endVertex.id;

  const pathCompleted = () => allEdgesTraveled() && isEndVertex();

  if (pathCompleted()) {
    const pathObject = { path: pathCarry, weight: pathWeight(pathCarry) };
    paths.push(pathObject);
    return;
  }

  const options = getOptions(currentVertex);

  options.forEach((edge) => {
    const nextVertex =
      edge.vertex1.id !== currentVertex.id ? edge.vertex1 : edge.vertex2;

    recursivelyTraversePath(
      nextVertex,
      endVertex,
      edges,
      [edge, ...pathCarry],
      depth + 1
    );
  });
}
