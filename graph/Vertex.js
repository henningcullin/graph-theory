/**
 * Represents a vertex in the graph.
 */
export class Vertex {
  /**
   * @param {number} x - The x-coordinate of the vertex.
   * @param {number} y - The y-coordinate of the vertex.
   * @param {number} id - The id of the vertex.
   */
  constructor(x, y, id) {
    /** @type {number} */
    this.x = x;
    /** @type {number} */
    this.y = y;
    /** @type {string} */
    this.label = label;
  }

  /**
   * Draws the vertex on the canvas.
   * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas.
   */
  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 20, 0, 2 * Math.PI);
    ctx.fillStyle = "lightblue";
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.id, this.x, this.y);
  }
}
