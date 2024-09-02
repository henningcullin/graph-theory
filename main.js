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

  BruteForceCalculate(startVertex, endVertex, edges);
});

function BruteForceCalculate(startVertex, endVertex, edges) {
  const NUM_WORKERS = 4;
  const TOTAL_ITERATIONS = document.getElementById("iterationCount").value;
  const iterationsPerWorker = Math.ceil(TOTAL_ITERATIONS / NUM_WORKERS);

  const workers = [];
  const meterIds = ["meter1", "meter2", "meter3", "meter4"];
  let completedWorkers = 0;
  let allPaths = [];

  // Create multiple workers and set up their message handlers
  for (let i = 0; i < NUM_WORKERS; i++) {
    const worker = new Worker("calculation-workers/BruteForce-v1.js");

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
