import {
  ccp_brute_v1,
  ccp_dijkstra_v1,
  ccp_exhaustive_v1,
  sp_dijkstra_v1,
} from "./calculation/v1/WorkerScripts.js";
import { GraphHandler } from "./graph/GraphHandler.js";
import { domLoaded } from "./graph/utils.js";
import { Vertex } from "./graph/Vertex.js";
import { solve_chinese_postman_problem } from "./v2/mccp-attempt-1.js";
import { solve_mccp } from "./v3/mccp.js";

await domLoaded();

const graphHandler = new GraphHandler("graphCanvas");

document.getElementById("calculateRoute")?.addEventListener("click", () => {
  const [startId, endId] =
    prompt(
      "Enter the start id and end id. They should be separated by a comma"
    )?.split(",") ?? [];

  const { vertices, edges } = graphHandler.graph;

  const [startVertex, endVertex] = [
    vertices.find((vertex) => vertex.id === parseInt(startId)),
    vertices.find((vertex) => vertex.id === parseInt(endId)),
  ];

  if (!(startVertex instanceof Vertex) || !(endVertex instanceof Vertex))
    return console.error("start or end vertex was undefined");

  // solve_chinese_postman_problem(startVertex, endVertex, graphHandler);

  //solve_mccp(startVertex, endVertex, graphHandler);

  const methods = {
    "ccp-dijkstra-1": () => ccp_dijkstra_v1(startVertex, endVertex, edges),
    "ccp-brute-1": () => ccp_brute_v1(startVertex, endVertex, edges),
    "ccp-exhaustive-1": () => ccp_exhaustive_v1(startVertex, endVertex, edges),
    "sp-dijkstra-1": () => sp_dijkstra_v1(startVertex, endVertex, edges),
  };

  const methodGroup = document.getElementById("calculationMethod");

  const method = methodGroup?.hasAttribute("value")
    ? methodGroup.getAttribute("value") ?? ""
    : "";

  if (typeof methods[method] === "function") {
    console.log("calculating using method", method);
    methods[method]();
  }
});
