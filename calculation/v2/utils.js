import { Edge } from "../../graph/Edge.js";

/**
 *
 * @param {Edge} edge
 * @param {number} vertexId
 * @returns {boolean}
 */
export const canTravel = (edge, vertexId) =>
  edge.direction === "any" ||
  (edge.direction === "from" && edge.vertex1.id === vertexId) ||
  (edge.direction === "to" && edge.vertex2.id === vertexId);
