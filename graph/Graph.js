import { Vertex } from "./Vertex.js";
import { Edge } from "./Edge.js";
import { unwrap } from "../calculation/v2/utils.js";

/**
 * Represents the graph, including vertices and edges.
 */
export class Graph {
  /**
   * @param {string} canvasId - The ID of the canvas element where the graph is drawn.
   */
  constructor(canvasId) {
    /** @type {Vertex[]} */
    this.vertices = [];
    /** @type {Edge[]} */
    this.edges = [];
    /** @type {HTMLCanvasElement} */
    this.canvas = /** @type {HTMLCanvasElement} */ (
      unwrap(document.getElementById(canvasId))
    );
    /** @type {CanvasRenderingContext2D} */
    this.ctx = unwrap(this.canvas.getContext("2d"));
  }

  /**
   * Adds a vertex to the graph.
   * @param {number} x - The x-coordinate of the vertex.
   * @param {number} y - The y-coordinate of the vertex.
   * @param {number} label - The label of the vertex.
   * @returns {Vertex} - The created vertex.
   */
  addVertex(x, y, label) {
    const vertex = new Vertex(x, y, label);
    this.vertices.push(vertex);
    return vertex;
  }

  /**
   * Adds an edge between two vertices.
   * @param {Vertex} vertex1 - The starting vertex of the edge.
   * @param {Vertex} vertex2 - The ending vertex of the edge.
   * @param {import('./Edge.js').Direction} [direction='any'] - The direction of the edge.
   * @param {number | null} [shadowId=null] - The id of the source edge
   */
  addEdge(vertex1, vertex2, direction = "any", shadowId = null) {
    const edge = new Edge(
      vertex1,
      vertex2,
      direction,
      this.edges.length + 1,
      shadowId
    );
    this.edges.push(edge);
  }

  /**
   * Draws the graph on the canvas.
   */
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.edges.forEach((edge) => edge.draw(this.ctx));
    this.vertices.forEach((vertex) => vertex.draw(this.ctx));
  }
}
