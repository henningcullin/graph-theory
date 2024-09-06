export function ccp_dijkstra_v1(startVertex, endVertex, edges) {
  const worker = new Worker(
    "calculation/v1/chinese-postman-problem/Dijkstra-v1.js"
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

export function ccp_exhaustive_v1(startVertex, endVertex, edges) {
  const worker = new Worker(
    "calculation/v1/chinese-postman-problem/ExhausivePath-v1.js"
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

export function ccp_brute_v1(startVertex, endVertex, edges) {
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
      "calculation/v1/chinese-postman-problem/BruteForce-v1.js"
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

export function sp_dijkstra_v1(startVertex, endVertex, edges) {
  const worker = new Worker("calculation/v1/shortest-path/Dijkstra-v1.js");

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
