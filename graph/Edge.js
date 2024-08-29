import { Vertex } from "./Vertex.js";

/**
 * @typedef {'to' | 'from' | 'any'} Direction
 */

/**
 * Represents an edge between two vertices.
 */
export class Edge {
  /**
   * @param {Vertex} vertex1 - The starting vertex of the edge.
   * @param {Vertex} vertex2 - The ending vertex of the edge.
   * @param {Direction} [direction='any'] - The direction of the edge.
   */
  constructor(vertex1, vertex2, direction = "any") {
    vertex1.edges.push(this);
    vertex2.edges.push(this);
    /** @type {Vertex} */
    this.vertex1 = vertex1;
    /** @type {Vertex} */
    this.vertex2 = vertex2;
    /** @type {Direction} */
    this.direction = direction;
    /** @type {number} */
    this.weight = this.calculateWeight();
  }

  /**
   * Calculates the weight of the edge based on the distance between vertices.
   * @returns {number} - The weight of the edge.
   */
  calculateWeight() {
    const dx = this.vertex2.x - this.vertex1.x;
    const dy = this.vertex2.y - this.vertex1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Checks if the edge is directed.
   * @returns {boolean} - True if the edge has a specific direction, false otherwise.
   */
  isDirected() {
    return this.direction !== "any";
  }

  /**
   * Draws the edge on the canvas.
   * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas.
   */
  draw(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.vertex1.x, this.vertex1.y);
    ctx.lineTo(this.vertex2.x, this.vertex2.y);
    ctx.strokeStyle = this.isDirected() ? "red" : "black";
    ctx.stroke();

    if (this.direction !== "any") {
      // Determine the direction for the arrow
      let fromVertex, toVertex;
      if (this.direction === "from") {
        fromVertex = this.vertex1;
        toVertex = this.vertex2;
      } else if (this.direction === "to") {
        fromVertex = this.vertex2;
        toVertex = this.vertex1;
      } else return;

      // Draw an arrowhead at the middle of the line pointing from `fromVertex` to `toVertex`
      let midX = (fromVertex.x + toVertex.x) / 2;
      let midY = (fromVertex.y + toVertex.y) / 2;
      let dx = toVertex.x - fromVertex.x;
      let dy = toVertex.y - fromVertex.y;
      let angle = Math.atan2(dy, dx);

      // Arrowhead size
      let arrowSize = 10;

      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.lineTo(
        midX - arrowSize * Math.cos(angle - Math.PI / 6),
        midY - arrowSize * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        midX - arrowSize * Math.cos(angle + Math.PI / 6),
        midY - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      ctx.lineTo(midX, midY);
      ctx.fillStyle = "red";
      ctx.fill();
    }
  }
}
