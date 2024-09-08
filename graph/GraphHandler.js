import { unwrap } from "../calculation/v2/utils.js";
import { Graph } from "./Graph.js";
import { Popup } from "./utils.js";
import { Vertex } from "./Vertex.js";

/** @typedef {0 | 1} Mode */

// Mode constants
const VERTEX_MODE = 0;
const EDGE_MODE = 1;

/**
 * Handles user interactions with the graph.
 */
export class GraphHandler {
  /**
   * @param {string} canvasId - The ID of the canvas element.
   */
  constructor(canvasId) {
    /** @type {Graph} */
    this.graph = new Graph(canvasId);
    /** @type {HTMLCanvasElement} */
    this.canvas = /** @type {HTMLCanvasElement} */ (
      unwrap(document.getElementById(canvasId))
    );
    /** @type {CanvasRenderingContext2D} */
    this.ctx = unwrap(this.canvas.getContext("2d"));
    /** @type {Popup} */
    this.popup = new Popup();
    /** @type {Mode} */
    this.currentMode = VERTEX_MODE; // Default mode
    /** @type {Vertex|null} */
    this.firstVertex = null;
    /** @type {import('./Edge.js').Direction} */
    this.currentDirection = "any"; // Default direction for edges

    this.currentMousePosition = null;

    this.canvas.addEventListener("mousemove", (event) =>
      this.handleMouseMove(event)
    );
    /**
     * @type {HTMLImageElement}
     */
    this.background = new Image();

    /**
     *
     * @param {Event} event
     * @returns
     */
    const onFileChange = (event) => {
      // @ts-ignore
      const file = event?.target?.files[0];
      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        // @ts-ignore
        this.background.src = e?.target?.result; // Image is loaded from file
      };
      reader.readAsDataURL(file); // Read file as a DataURL
    };

    document
      .getElementById("backgroundImage")
      ?.addEventListener("change", onFileChange);

    // Set up control panel buttons
    document
      ?.getElementById("vertexModeBtn")
      ?.addEventListener("click", () => this.setMode(VERTEX_MODE));
    document
      ?.getElementById("edgeModeBtn")
      ?.addEventListener("click", () => this.setMode(EDGE_MODE));

    // Set up edge direction controls
    /** @type {HTMLCanvasElement} */
    this.canvas = /** @type {HTMLCanvasElement} */ (
      unwrap(document.getElementById(canvasId))
    );
    /** @type {RadioButtonGroup} */
    const edgeDirectionGroup = unwrap(
      /** @type {RadioButtonGroup} */ (
        document?.getElementById("edgeDirection")
      )
    );

    edgeDirectionGroup.value = "any";

    /**
     *
     * @param {*} event
     */
    edgeDirectionGroup.onChange = (event) => {
      this.currentDirection = event.detail.value;
      this.updateStatus(`Edge direction set to ${this.currentDirection}`);
    };

    // Set up status display
    this.statusElement = document.getElementById("status");

    this.canvas.addEventListener("click", (event) => this.handleClick(event));
    this.updateStatus("Ready");
    this.animate();
  }

  /**
   * Sets the current mode of the graph handler.
   * @param {Mode} mode - The mode to set.
   */
  setMode(mode) {
    this.currentMode = mode;
    if (mode === EDGE_MODE) {
      unwrap(document?.getElementById("edgeDirection")?.style).display =
        "block";
      this.updateStatus("Click on the first vertex to start creating an edge.");
    } else {
      unwrap(document?.getElementById("edgeDirection")?.style).display = "none";
      this.updateStatus("Ready");
    }
  }

  /**
   * Handles click events on the canvas.
   * @param {MouseEvent} event - The click event.
   */
  handleClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (this.currentMode === VERTEX_MODE) {
      this.handleVertexClick(x, y);
    } else if (this.currentMode === EDGE_MODE) {
      this.handleEdgeClick(x, y);
    }
  }

  /**
   * Handles clicks in vertex mode.
   * @param {number} x - The x-coordinate of the click.
   * @param {number} y - The y-coordinate of the click.
   */
  handleVertexClick(x, y) {
    const clickedVertex = this.getVertexAt(x, y);

    if (clickedVertex) {
      this.showPopup(clickedVertex);
    } else {
      const id = this.graph.vertices.length + 1;
      this.graph.addVertex(x, y, id);
      this.graph.draw();
    }
  }

  /**
   * Handles clicks in edge mode.
   * @param {number} x - The x-coordinate of the click.
   * @param {number} y - The y-coordinate of the click.
   */
  handleEdgeClick(x, y) {
    const vertex = this.getVertexAt(x, y);

    if (this.firstVertex) {
      if (vertex && vertex !== this.firstVertex) {
        this.graph.addEdge(this.firstVertex, vertex, this.currentDirection);
        this.firstVertex = null;
        this.currentMousePosition = null; // Reset mouse position
        this.updateStatus("Edge created. Ready.");
      }
    } else {
      if (vertex) {
        this.firstVertex = vertex;
        this.updateStatus("Click on the second vertex to create an edge.");
      }
    }
  }

  /**
   * Finds if there's a vertex near the clicked position.
   * @param {number} x - The x-coordinate of the click.
   * @param {number} y - The y-coordinate of the click.
   * @returns {Vertex | undefined} - The vertex if found, otherwise null.
   */
  getVertexAt(x, y) {
    return this.graph.vertices.find((vertex) => {
      const dx = vertex.x - x;
      const dy = vertex.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= 20; // Assuming a radius of 20 for the vertex
    });
  }

  /**
   * Shows the popup dialog for the clicked vertex.
   * @param {Vertex} vertex - The vertex for which to show the popup.
   */
  showPopup(vertex) {
    this.popup.setContent([
      {
        label: `Vertex: ${vertex.id}`,
        action: () => {}, // Placeholder for action
      },
      {
        label: "Edit",
        action: () => {
          alert(`Edit ${vertex.id}`);
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

  /**
   * Updates the status display with the given message.
   * @param {string} message - The status message to display.
   */
  updateStatus(message) {
    if (this.statusElement) {
      this.statusElement.textContent = `Status: ${message}`;
    }
  }

  /**
   *
   * @param {MouseEvent} event
   */
  handleMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.currentMousePosition = { x, y };
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Get image's natural width and height
    const imgWidth = this.background.naturalWidth || 1280;
    const imgHeight = this.background.naturalHeight || 720;

    // Resize the canvas to match the image size
    this.canvas.width = imgWidth;
    this.canvas.height = imgHeight;

    this.ctx.drawImage(this.background, 0, 0, imgWidth, imgHeight);
    this.graph.draw();

    if (this.firstVertex && this.currentMousePosition) {
      // Draw edge from first vertex to current mouse position
      this.drawTemporaryEdge(this.firstVertex, this.currentMousePosition);
    }

    requestAnimationFrame(() => this.animate());
  }

  /**
   *
   * @param {Vertex} vertex
   * @param {{x: number, y: number}} mousePosition
   */
  drawTemporaryEdge(vertex, mousePosition) {
    // Draw the edge line
    this.ctx.beginPath();
    this.ctx.moveTo(vertex.x, vertex.y);
    this.ctx.lineTo(mousePosition.x, mousePosition.y);
    this.ctx.strokeStyle = this.currentDirection === "any" ? "black" : "red"; // Same styling for completed edges
    this.ctx.setLineDash([5, 5]); // Dashed line for the temporary edge
    this.ctx.stroke();
    this.ctx.setLineDash([]); // Reset dash style

    if (this.currentDirection !== "any") {
      // Draw arrowhead
      let fromVertex, toVertex;
      if (this.currentDirection === "from") {
        fromVertex = vertex;
        toVertex = mousePosition;
      } else if (this.currentDirection === "to") {
        fromVertex = mousePosition;
        toVertex = vertex;
      } else return;

      let midX = (fromVertex.x + toVertex.x) / 2;
      let midY = (fromVertex.y + toVertex.y) / 2;
      let dx = toVertex.x - fromVertex.x;
      let dy = toVertex.y - fromVertex.y;
      let angle = Math.atan2(dy, dx);

      let arrowSize = 10;

      this.ctx.beginPath();
      this.ctx.moveTo(midX, midY);
      this.ctx.lineTo(
        midX - arrowSize * Math.cos(angle - Math.PI / 6),
        midY - arrowSize * Math.sin(angle - Math.PI / 6)
      );
      this.ctx.lineTo(
        midX - arrowSize * Math.cos(angle + Math.PI / 6),
        midY - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      this.ctx.lineTo(midX, midY);
      this.ctx.fillStyle = "red"; // Same color as the arrow for completed edges
      this.ctx.fill();
    }
  }
}
