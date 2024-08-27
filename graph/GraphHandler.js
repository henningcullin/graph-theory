import { Graph } from "./graph.js";
import { Popup } from "./utils.js";

export class GraphHandler {
  constructor(canvasId) {
    this.graph = new Graph(canvasId);
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.popup = new Popup();
    this.selectedVertex = null;

    this.canvas.addEventListener("click", (event) => this.handleClick(event));
    this.graph.draw();
  }

  handleClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if the click is on an existing vertex
    const clickedVertex = this.getVertexAt(x, y);

    if (clickedVertex) {
      this.selectedVertex = clickedVertex;
      this.showPopup(clickedVertex);
    } else {
      // Add a new vertex if not clicking on an existing vertex
      const label = prompt("Enter label for the vertex:", "New Vertex");
      if (label) {
        this.graph.addVertex(x, y, label);
        this.graph.draw();
      }
    }
  }

  getVertexAt(x, y) {
    // Find if there's a vertex near the clicked position
    return this.graph.vertices.find((vertex) => {
      const dx = vertex.x - x;
      const dy = vertex.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= 20; // Assuming a radius of 20 for the vertex
    });
  }

  showPopup(vertex) {
    this.popup.setContent([
      {
        label: `Vertex: ${vertex.label}`,
        action: () => {}, // Placeholder for action
      },
      {
        label: "Edit",
        action: () => {
          alert(`Edit ${vertex.label}`);
          this.popup.close();
        },
      },
      {
        label: "Delete",
        action: () => {
          this.removeVertex(vertex);
          this.popup.close();
        },
      },
      {
        label: "Cancel",
        action: () => {
          this.popup.close();
        },
      },
    ]);
    this.popup.show();
  }

  removeVertex(vertex) {
    // Remove the vertex from the vertices array
    const index = this.graph.vertices.indexOf(vertex);
    if (index !== -1) {
      this.graph.vertices.splice(index, 1);
    }

    // Remove edges connected to the vertex
    this.graph.edges = this.graph.edges.filter(
      (edge) => edge.vertex1 !== vertex && edge.vertex2 !== vertex
    );

    // Redraw the graph
    this.graph.draw();
  }
}
