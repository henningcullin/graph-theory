const paths = [];
let minPathWeight = Infinity;
const MAX_RECURSION_LIMIT = 200;

onmessage = function (event) {
  const { startVertex, endVertex, edges } = event.data;

  recursivelyTraversePath(startVertex, endVertex, edges, [], 0, 0);

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
  depth,
  currentWeight
) {
  // Prune branches that exceed the recursion depth limit
  if (depth > MAX_RECURSION_LIMIT) return console.log("Dropping: Recursion");

  // Prune branches where the current path weight already exceeds the minimum found so far
  if (currentWeight >= minPathWeight) return console.log("Dropping: Weight");

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
    const pathObject = { path: pathCarry, weight: currentWeight };
    paths.push(pathObject);
    // Update the minimum path weight
    if (currentWeight < minPathWeight) {
      minPathWeight = currentWeight;
    }
    return;
  }

  const options = getOptions(currentVertex);

  options.forEach((edge) => {
    const nextVertex =
      edge.vertex1.id !== currentVertex.id ? edge.vertex1 : edge.vertex2;

    // Calculate the new weight for this path
    const newWeight = currentWeight + edge.weight;

    // Continue traversing with the updated path and weight
    recursivelyTraversePath(
      nextVertex,
      endVertex,
      edges,
      [edge, ...pathCarry],
      depth + 1,
      newWeight
    );
  });
}
