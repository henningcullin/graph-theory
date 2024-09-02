class PriorityQueue {
  constructor() {
    this.elements = [];
  }

  enqueue(item, priority) {
    this.elements.push({ item, priority });
    this.elements.sort((a, b) => a.priority - b.priority);
  }

  dequeue() {
    return this.elements.shift().item;
  }

  isEmpty() {
    return this.elements.length === 0;
  }
}

onmessage = function (event) {
  const { startVertex, endVertex, edges } = event.data;

  // Execute Dijkstra's algorithm to find the shortest path
  const shortestPath = dijkstra(startVertex, endVertex, edges);

  // Send the result back to the main thread
  postMessage({ paths: shortestPath ? [shortestPath] : [], type: "done" });
};

const canTravel = (edge, vertexId) =>
  edge.direction === "any" ||
  (edge.direction === "from" && edge.vertex1.id === vertexId) ||
  (edge.direction === "to" && edge.vertex2.id === vertexId);

const getOptions = (vertex) =>
  vertex.edges.filter((edge) => canTravel(edge, vertex.id));

function dijkstra(startVertex, endVertex, edges) {
  const distances = new Map();
  const previousVertices = new Map();
  const pq = new PriorityQueue();

  // Initialize distances to infinity and start vertex distance to 0
  distances.set(startVertex.id, 0);
  pq.enqueue(startVertex, 0);

  // Dijkstra's algorithm loop
  while (!pq.isEmpty()) {
    const currentVertex = pq.dequeue();

    // If we reached the end vertex, build and return the shortest path
    if (currentVertex.id === endVertex.id) {
      return buildPath(endVertex, previousVertices);
    }

    // Explore neighbors
    const options = getOptions(currentVertex);
    options.forEach((edge) => {
      const neighbor =
        edge.vertex1.id !== currentVertex.id ? edge.vertex1 : edge.vertex2;
      const newDistance = distances.get(currentVertex.id) + edge.weight;

      // If a shorter path to the neighbor is found, update the path
      if (
        !distances.has(neighbor.id) ||
        newDistance < distances.get(neighbor.id)
      ) {
        distances.set(neighbor.id, newDistance);
        previousVertices.set(neighbor.id, { vertex: currentVertex, edge });
        pq.enqueue(neighbor, newDistance);
      }
    });
  }

  // If we exit the loop, there is no path from start to end
  return null;
}

function buildPath(endVertex, previousVertices) {
  const path = [];
  let currentVertex = endVertex;

  while (previousVertices.has(currentVertex.id)) {
    const { vertex, edge } = previousVertices.get(currentVertex.id);
    path.unshift(edge);
    currentVertex = vertex;
  }

  return { path, weight: pathWeight(path) };
}

const pathWeight = (path) => path.reduce((acc, curr) => acc + curr.weight, 0);
