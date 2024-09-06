import { Edge } from "../../graph/Edge.js";

/**
 *
 * @param {Edge} edge edge to check if we can travel
 * @param {number} vertexId vertex we are currently on
 * @returns {boolean}
 */
export const canTravel = (edge, vertexId, reverse = false) =>
  edge.direction === "any" ||
  (reverse
    ? (edge.direction === "from" && edge.vertex2.id === vertexId) ||
      (edge.direction === "to" && edge.vertex1.id === vertexId)
    : (edge.direction === "from" && edge.vertex1.id === vertexId) ||
      (edge.direction === "to" && edge.vertex2.id === vertexId));
