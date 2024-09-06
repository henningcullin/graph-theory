import { Edge } from "../../graph/Edge.js";
import { Vertex } from "../../graph/Vertex.js";
import { canTravel, unwrap } from "./utils.js";

/**
 *
 * @param {Vertex} startVertex
 * @returns {Map<number, Vertex>}
 */
function flood_fill(startVertex) {
  /**
   * @type {Vertex[]}
   */
  const queue = [startVertex];
  const visitedVerticies = new Map();

  while (queue?.length > 0) {
    const currentVertex = unwrap(queue.shift());

    visitedVerticies.set(currentVertex.id, currentVertex);

    const edges = currentVertex.edges.filter((edge) =>
      canTravel(edge, currentVertex.id)
    );

    for (const edge of edges) {
      const oppositeVertex =
        edge.vertex1.id === currentVertex.id ? edge.vertex2 : edge.vertex1;

      if (!visitedVerticies.has(oppositeVertex.id)) {
        queue.push(oppositeVertex);
      }
    }
  }

  return visitedVerticies;
}

/**
 *
 * @param {Vertex} startVertex
 * @param {Vertex} endVertex
 * @returns {[Map<number, Vertex>, Map<number, Edge>]}
 */
export function get_flood_filled(startVertex, endVertex) {
  const vertexMap = flood_fill(startVertex);

  if (!vertexMap.has(endVertex.id))
    throw new Error("startVertex and endVertex not connected!");

  const edgeMap = Array.from(vertexMap.values()).reduce((acc, curr) => {
    curr.edges.forEach((edge) => {
      if (!acc.has(edge.id)) acc.set(edge.id, edge);
    });

    return acc;
  }, new Map());

  return [vertexMap, edgeMap];
}
