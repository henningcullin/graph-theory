import { Edge } from "../../graph/Edge.js";

/**
 *
 * @param {Edge} edge edge to check if we can travel
 * @param {number} vertexId vertex we are currently on
 * @returns {boolean}
 */
export const canTravel = (edge, vertexId, reverse = false) =>
  (edge.direction === "any" &&
    (edge.vertex1.id === vertexId || edge.vertex2.id === vertexId)) ||
  (reverse
    ? (edge.direction === "from" && edge.vertex2.id === vertexId) ||
      (edge.direction === "to" && edge.vertex1.id === vertexId)
    : (edge.direction === "from" && edge.vertex1.id === vertexId) ||
      (edge.direction === "to" && edge.vertex2.id === vertexId));

/**
 * Unwraps a value that might be undefined and throws an error if it is undefined.
 *
 * @template T
 * @param {T | undefined | null}  possiblyUndefined - The value that might be undefined.
 * @returns {T} The unwrapped value, guaranteed not to be undefined.
 * @throws {Error} Throws if the value is undefined.
 */
export function unwrap(possiblyUndefined) {
  if (possiblyUndefined === undefined || possiblyUndefined === null) {
    throw new Error("Item was undefined");
  } else {
    return possiblyUndefined;
  }
}
