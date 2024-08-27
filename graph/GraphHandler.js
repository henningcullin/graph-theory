import { Graph } from "./Graph.js";

export class GraphHandler {
  constructor(canvasId) {
    this.graph = new Graph(canvasId);
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.selectedVertex = null;
    this.canvas.addEventListener("click", (event) => this.handleClick(event));
  }

  handleClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    console.log("wow");

    if (this.selectedVertex) {
      // Handle edge creation or other functionality if needed
      this.selectedVertex = null;
    } else {
      // Add a new vertex at the click location
      const label = prompt("Enter label for the vertex:", "New Vertex");
      if (label) {
        this.graph.addVertex(x, y, label);
        this.graph.draw();
      }
    }
  }
}
