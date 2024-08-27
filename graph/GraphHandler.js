import { Graph } from "./graph.js";
import { Popup } from "./utils.js";

/**
 * Handles user interactions with the graph, including vertex and edge creation.
 */
export class GraphHandler {
  /**
   * @param {string} canvasId - The ID of the canvas element where the graph is drawn.
   */
  constructor(canvasId) {
    /** @type {Graph} */
    this.graph = new Graph(canvasId);
    /** @type {HTMLCanvasElement} */
    this.canvas = document.getElementById(canvasId);
    /** @type {CanvasRenderingContext2D} */
    this.ctx = this.canvas.getContext("2d");
    /** @type {Popup} */
    this.popup = new Popup();
    /** @type {Vertex | null} */
    this.selectedVertex = null;
    /** @type {Vertex | null} */
    this.startVertex = null; // Vertex from which edge creation starts

    this.canvas.addEventListener("click", (event) => this.handleClick(event));
    this.graph.draw();
  }

  /**
   * Handles click events on the canvas.
   * @param {MouseEvent} event - The click event.
   */
  handleClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if the click is on an existing vertex
    const clickedVertex = this.getVertexAt(x, y);

    if (clickedVertex) {
      if (this.startVertex) {
        if (this.startVertex !== clickedVertex) {
          // Create edge between startVertex and clickedVertex
          this.graph.addEdge(this.startVertex, clickedVertex);
          this.graph.draw();
        }
        this.startVertex = null; // Reset startVertex
      } else {
        this.startVertex = clickedVertex; // Set startVertex
        this.showPopup(clickedVertex);
      }
    } else {
      // Add a new vertex if not clicking on an existing vertex
      const label = prompt("Enter label for the vertex:", "New Vertex");
      if (label) {
        this.graph.addVertex(x, y, label);
        this.graph.draw();
      }
    }
  }

  /**
   * Finds a vertex at the specified coordinates.
   * @param {number} x - The x-coordinate to check.
   * @param {number} y - The y-coordinate to check.
   * @returns {Vertex | undefined} - The vertex found at the coordinates or undefined if none.
   */
  getVertexAt(x, y) {
    // Find if there's a vertex near the clicked position
    return this.graph.vertices.find((vertex) => {
      const dx = vertex.x - x;
      const dy = vertex.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= 20; // Assuming a radius of 20 for the vertex
    });
  }

  /**
   * Shows the popup with options for the selected vertex.
   * @param {Vertex} vertex - The vertex for which to show the popup.
   */
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

  /**
   * Removes the specified vertex and its associated edges from the graph.
   * @param {Vertex} vertex - The vertex to remove.
   */
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
