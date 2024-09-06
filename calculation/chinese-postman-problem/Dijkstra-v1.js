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

  // Step 1: Make the graph Eulerian by adding extra edges where necessary
  const eulerizedGraph = makeGraphEulerian(edges);

  // Step 2: Find the Eulerian circuit/path that covers all edges at least once
  const eulerianCircuit = findEulerianCircuit(eulerizedGraph, startVertex);

  // Step 3: Adjust the Eulerian circuit to be a path from startVertex to endVertex
  const pathCoveringAllEdges = adjustPathToStartAndEnd(
    eulerianCircuit,
    startVertex,
    endVertex
  );

  // Send the result back to the main thread
  postMessage({
    paths: pathCoveringAllEdges ? [pathCoveringAllEdges] : [],
    type: "done",
  });
};

// Utility to determine if an edge can be traveled in a given direction
const canTravel = (edge, vertexId) =>
  edge.direction === "any" ||
  (edge.direction === "from" && edge.vertex1.id === vertexId) ||
  (edge.direction === "to" && edge.vertex2.id === vertexId);

// Get edges that can be traveled from a specific vertex
const getOptions = (vertex) =>
  vertex.edges.filter((edge) => canTravel(edge, vertex.id));

// Step 1: Make the graph Eulerian by connecting odd-degree vertices
function makeGraphEulerian(edges) {
  const oddDegreeVertices = findOddDegreeVertices(edges);

  // Find shortest paths between all pairs of odd-degree vertices
  const pairs = findShortestPathsBetweenOddVertices(oddDegreeVertices, edges);

  // Add the shortest paths between odd-degree vertices to the graph (duplicate some edges)
  pairs.forEach((pair) => {
    edges.push(...pair.path);
  });

  return edges;
}

// Step 2: Find an Eulerian circuit (or path) that visits all edges at least once
function findEulerianCircuit(edges, startVertex) {
  const circuit = [];
  const edgeVisited = new Set();

  function dfs(vertex) {
    const options = getOptions(vertex).filter((edge) => !edgeVisited.has(edge));

    for (let edge of options) {
      edgeVisited.add(edge);
      const neighbor =
        edge.vertex1.id !== vertex.id ? edge.vertex1 : edge.vertex2;
      dfs(neighbor);
      circuit.push(edge); // Add edge to the circuit
    }
  }

  dfs(startVertex);
  return circuit;
}

// Find vertices with odd degrees
function findOddDegreeVertices(edges) {
  const degreeMap = new Map();

  edges.forEach((edge) => {
    incrementVertexDegree(degreeMap, edge.vertex1);
    incrementVertexDegree(degreeMap, edge.vertex2);
  });

  return [...degreeMap.entries()]
    .filter(([vertex, degree]) => degree % 2 === 1)
    .map(([vertex]) => vertex);
}

// Increment the degree of a vertex in the degree map
function incrementVertexDegree(degreeMap, vertex) {
  degreeMap.set(vertex, (degreeMap.get(vertex) || 0) + 1);
}

// Find the shortest paths between odd-degree vertices using Dijkstra
function findShortestPathsBetweenOddVertices(oddVertices, edges) {
  const pairs = [];

  for (let i = 0; i < oddVertices.length; i++) {
    for (let j = i + 1; j < oddVertices.length; j++) {
      const path = dijkstra(oddVertices[i], oddVertices[j], edges);
      pairs.push({ vertex1: oddVertices[i], vertex2: oddVertices[j], path });
    }
  }

  return pairs;
}

// Step 3: Adjust the Eulerian circuit/path to start and end at specified vertices
function adjustPathToStartAndEnd(eulerianCircuit, startVertex, endVertex) {
  const path = [];
  let foundStart = false;

  // Traverse the Eulerian circuit and extract the part from start to end vertex
  for (let edge of eulerianCircuit) {
    if (
      edge.vertex1.id === startVertex.id ||
      edge.vertex2.id === startVertex.id
    ) {
      foundStart = true;
    }

    if (foundStart) {
      path.push(edge);
    }

    if (edge.vertex1.id === endVertex.id || edge.vertex2.id === endVertex.id) {
      break;
    }
  }

  return { path, weight: pathWeight(path) };
}

// Dijkstra's algorithm to find the shortest path between two vertices
function dijkstra(startVertex, endVertex, edges) {
  const distances = new Map();
  const previousVertices = new Map();
  const pq = new PriorityQueue();

  distances.set(startVertex.id, 0);
  pq.enqueue(startVertex, 0);

  while (!pq.isEmpty()) {
    const currentVertex = pq.dequeue();

    if (currentVertex.id === endVertex.id) {
      return buildPath(endVertex, previousVertices);
    }

    const options = getOptions(currentVertex);
    options.forEach((edge) => {
      const neighbor =
        edge.vertex1.id !== currentVertex.id ? edge.vertex1 : edge.vertex2;
      const newDistance = distances.get(currentVertex.id) + edge.weight;

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

  return null;
}

// Build the shortest path from the endVertex to the start using the previousVertices map
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

// Calculate the total weight of a path
const pathWeight = (path) => path.reduce((acc, curr) => acc + curr.weight, 0);
