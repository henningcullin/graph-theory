import { canTravel, unwrap } from "../calculation/v2/utils.js";
import { Edge } from "../graph/Edge.js";
import { Vertex } from "../graph/Vertex.js";

class PriorityQueue {
  constructor() {
    /**
     * @type {{item: Vertex, priority: number}[]}
     */
    this.elements = [];
  }

  /**
   *
   * @param {Vertex} item
   * @param {number} priority
   */
  enqueue(item, priority) {
    this.elements.push({ item, priority });
    this.elements.sort((a, b) => a.priority - b.priority);
  }

  dequeue() {
    return this.elements?.shift()?.item;
  }

  isEmpty() {
    return this.elements.length === 0;
  }
}
/**
 *
 * @param {Vertex} vertex
 * @returns
 */
const getOptions = (vertex) =>
  vertex.edges.filter((edge) => canTravel(edge, vertex.id));

/**
 * @typedef {Map<number, { vertex: Vertex, edge: Edge}>} PreviousVerticies
 */

/**
 *
 * @param {Vertex} startVertex
 * @param {Vertex} endVertex
 * @returns
 */
export function dijkstra(startVertex, endVertex) {
  /**
   * @type {Map<number, number>}
   */
  const distances = new Map();
  /**
   * @type {PreviousVerticies}
   */
  const previousVertices = new Map();
  const pq = new PriorityQueue();

  // Initialize distances to infinity and start vertex distance to 0
  distances.set(startVertex.id, 0);
  pq.enqueue(startVertex, 0);

  // Dijkstra's algorithm loop
  while (!pq.isEmpty()) {
    const currentVertex = unwrap(pq.dequeue());

    // If we reached the end vertex, build and return the shortest path
    if (currentVertex.id === endVertex.id) {
      return buildPath(endVertex, previousVertices);
    }

    // Explore neighbors
    const options = getOptions(currentVertex);
    options.forEach((edge) => {
      const neighbor =
        edge.vertex1.id !== currentVertex.id ? edge.vertex1 : edge.vertex2;

      const newDistance = unwrap(distances.get(currentVertex.id)) + edge.weight;

      // If a shorter path to the neighbor is found, update the path
      if (
        !distances.has(neighbor.id) ||
        newDistance < unwrap(distances.get(neighbor.id))
      ) {
        distances.set(neighbor.id, newDistance);
        previousVertices.set(neighbor.id, { vertex: currentVertex, edge });
        pq.enqueue(neighbor, newDistance);
      }
    });
  }

  // If we exit the loop, there is no path from start to end
  return null;
}

/**
 *
 * @param {Vertex} endVertex
 * @param {PreviousVerticies} previousVertices
 * @returns {{path: Edge[], weight: number}}
 */
function buildPath(endVertex, previousVertices) {
  const path = [];
  let currentVertex = endVertex;

  while (previousVertices.has(currentVertex.id)) {
    const { vertex, edge } = previousVertices.get(currentVertex.id) ?? {};
    path.unshift(unwrap(edge));
    currentVertex = unwrap(vertex);
  }

  return { path, weight: pathWeight(path) };
}

/**
 *
 * @param {Edge[]} path
 * @returns {number}
 */
const pathWeight = (path) => path.reduce((acc, curr) => acc + curr.weight, 0);
