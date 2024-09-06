import { GraphHandler } from "../graph/GraphHandler.js";
import { domLoaded } from "../graph/utils.js";

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

  const methods = {
    "ccp-dijkstra-1": () => ccp_dijkstra_v1(startVertex, endVertex, edges),
    "ccp-brute-1": () => ccp_brute_v1(startVertex, endVertex, edges),
    "ccp-exhaustive-1": () => ccp_exhaustive_v1(startVertex, endVertex, edges),
    "sp-dijkstra-1": () => sp_dijkstra_v1(startVertex, endVertex, edges),
  };

  const method = document.getElementById("calculationMethod").value;

  console.log("calculating using method", method);

  FloodFill(edges, startVertex, endVertex);

  methods[method]();
});

function ccp_dijkstra_v1(startVertex, endVertex, edges) {
  const worker = new Worker(
    "calculation/chinese-postman-problem/Dijkstra-v1.js"
  );

  worker.onmessage = function (event) {
    const { type, paths } = event.data;

    if (type === "done") {
      console.log(paths);
    }
  };

  worker.postMessage({
    startVertex,
    endVertex,
    edges,
  });
}

function ccp_exhaustive_v1(startVertex, endVertex, edges) {
  const worker = new Worker(
    "calculation/chinese-postman-problem/ExhausivePath-v1.js"
  );

  worker.onmessage = function (event) {
    const { type, paths } = event.data;

    if (type === "done") {
      paths.sort((a, b) => a.weight - b.weight);
      console.log(paths);
    }
  };

  worker.postMessage({ startVertex, endVertex, edges });
}

function ccp_brute_v1(startVertex, endVertex, edges) {
  const NUM_WORKERS = 4;
  const TOTAL_ITERATIONS = document.getElementById("iterationCount").value;
  const iterationsPerWorker = Math.ceil(TOTAL_ITERATIONS / NUM_WORKERS);

  const workers = [];
  const meterIds = ["meter1", "meter2", "meter3", "meter4"];
  let completedWorkers = 0;
  let allPaths = [];

  // Create multiple workers and set up their message handlers
  for (let i = 0; i < NUM_WORKERS; i++) {
    const worker = new Worker(
      "calculation/chinese-postman-problem/BruteForce-v1.js"
    );

    worker.onmessage = function (event) {
      const { type, progress, paths } = event.data;

      if (type === "progress") {
        // Update the corresponding meter element
        const meterElement = document.getElementById(meterIds[i]);
        meterElement.value = progress / 100;
      } else if (type === "done") {
        allPaths = allPaths.concat(paths);
        completedWorkers++;

        if (completedWorkers === NUM_WORKERS) {
          // Sort the combined paths when all workers are done
          allPaths.sort((a, b) => a.weight - b.weight);
          console.log(allPaths);
        }
      }
    };

    workers.push(worker);
  }

  // Send data to each worker
  for (let i = 0; i < NUM_WORKERS; i++) {
    workers[i].postMessage({
      startVertex,
      endVertex,
      edges,
      iterations: iterationsPerWorker,
    });
  }
}

function sp_dijkstra_v1(startVertex, endVertex, edges) {
  const worker = new Worker("calculation/shortest-path/Dijkstra-v1.js");

  worker.onmessage = function (event) {
    const { type, paths } = event.data;

    if (type === "done") {
      console.log(paths);
    }
  };

  worker.postMessage({
    startVertex,
    endVertex,
    edges,
  });
}

/**
 * Performs a flood fill algorithm to collect all reachable edges and vertices from startVertex
 * and checks if endVertex is among them.
 * @param {Edge[]} edges - The array of edges.
 * @param {Vertex} startVertex - The starting vertex.
 * @param {Vertex} endVertex - The target vertex to check for reachability.
 * @throws {Error} Throws an error if endVertex is not reachable from startVertex.
 */
function FloodFill(edges, startVertex, endVertex) {
  if (startVertex.id === endVertex.id) return; // The startVertex is the same as the endVertex.

  const queue = [startVertex];
  const visitedVertices = new Set();
  const visitedEdges = new Set();

  // Initialize visitedVertices with startVertex
  visitedVertices.add(startVertex.id);

  console.log("floodfilling");

  while (queue.length > 0) {
    const currentVertex = queue.shift();

    for (const edge of edges) {
      if (edge.direction === "to" && edge.vertex1.id === currentVertex.id) {
        if (!visitedEdges.has(edge.id)) {
          visitedEdges.add(edge.id);

          // Add vertex2 to queue if not visited
          if (!visitedVertices.has(edge.vertex2.id)) {
            visitedVertices.add(edge.vertex2.id);
            queue.push(edge.vertex2);
          }
        }
      } else if (
        edge.direction === "from" &&
        edge.vertex2.id === currentVertex.id
      ) {
        if (!visitedEdges.has(edge.id)) {
          visitedEdges.add(edge.id);

          // Add vertex1 to queue if not visited
          if (!visitedVertices.has(edge.vertex1.id)) {
            visitedVertices.add(edge.vertex1.id);
            queue.push(edge.vertex1);
          }
        }
      } else if (edge.direction === "any") {
        if (
          edge.vertex1.id === currentVertex.id ||
          edge.vertex2.id === currentVertex.id
        ) {
          if (!visitedEdges.has(edge.id)) {
            visitedEdges.add(edge.id);

            // Add the opposite vertex to the queue if not visited
            const nextVertex =
              edge.vertex1.id === currentVertex.id
                ? edge.vertex2
                : edge.vertex1;
            if (!visitedVertices.has(nextVertex.id)) {
              visitedVertices.add(nextVertex.id);
              queue.push(nextVertex);
            }
          }
        }
      }
    }
  }

  console.log("graph flood filled");
  console.log(visitedVertices);
  console.log(visitedEdges);

  // Check if endVertex is reachable
  if (!visitedVertices.has(endVertex.id)) {
    throw new Error("endVertex is not reachable from startVertex.");
  }

  return visitedEdges;
}
