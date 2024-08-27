export class Vertex {
  constructor(x, y, label) {
    this.x = x;
    this.y = y;
    this.label = label;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 20, 0, 2 * Math.PI);
    ctx.fillStyle = "lightblue";
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.label, this.x, this.y);
  }
}
