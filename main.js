import {
  ccp_brute_v1,
  ccp_dijkstra_v1,
  ccp_exhaustive_v1,
  sp_dijkstra_v1,
} from "./calculation/v1/WorkerScripts.js";
import { GraphHandler } from "./graph/GraphHandler.js";
import { domLoaded, get_edges } from "./graph/utils.js";

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

  get_edges(startVertex);

  methods[method]();
});
