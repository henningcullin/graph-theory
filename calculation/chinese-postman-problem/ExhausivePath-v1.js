const paths = [];
let minPathWeight = Infinity;
const MAX_DEPTH = 256; // Adjustable max depth for IDDFS

onmessage = function (event) {
  const { startVertex, endVertex, edges } = event.data;

  // Initialize memoization map
  const memo = new Map();

  // Start iterative deepening depth-first search
  for (let depth = 1; depth <= MAX_DEPTH; depth++) {
    recursivelyTraversePath(
      startVertex,
      endVertex,
      edges,
      [],
      0,
      0,
      depth,
      memo
    );
    console.log(depth);
    if (paths?.length) break;
  }

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
  vertex.edges
    .filter((edge) => canTravel(edge, vertex.id))
    .sort((a, b) => a.weight - b.weight); // Sort edges by weight

function recursivelyTraversePath(
  currentVertex,
  endVertex,
  edges,
  pathCarry,
  depth,
  currentWeight,
  maxDepth,
  memo
) {
  if (depth > maxDepth) return;

  if (currentWeight >= minPathWeight) return;

  /*   // Check if this state has been memoized
  const memoKey = `${currentVertex.id}:${depth}`;
  if (memo.has(memoKey) && memo.get(memoKey) <= currentWeight) {
    return;
  }
  memo.set(memoKey, currentWeight); */

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
    if (currentWeight < minPathWeight) {
      minPathWeight = currentWeight;
    }
    return;
  }

  const options = getOptions(currentVertex);

  options.forEach((edge) => {
    const nextVertex =
      edge.vertex1.id !== currentVertex.id ? edge.vertex1 : edge.vertex2;

    const newWeight = currentWeight + edge.weight;

    recursivelyTraversePath(
      nextVertex,
      endVertex,
      edges,
      [...pathCarry, edge], // Use spread operator to avoid creating new arrays unnecessarily
      depth + 1,
      newWeight,
      maxDepth,
      memo
    );
  });
}
