import { Vertex } from "./Vertex.js";

/**
 * @typedef {'to' | 'from' | 'any'} Direction
 */

export class Edge {
  /**
   * @param {Vertex} vertex1
   * @param {Vertex} vertex2
   * @param {Direction} direction
   */
  constructor(vertex1, vertex2, direction = "any") {
    this.vertex1 = vertex1;
    this.vertex2 = vertex2;
    this.direction = direction; // 'from' means vertex1 -> vertex2, 'to' means vertex2 -> vertex1
  }

  isDirected() {
    return this.direction !== "any";
  }

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
