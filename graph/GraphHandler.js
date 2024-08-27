import { Graph } from "./graph.js";
import { Popup } from "./utils.js";

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
    this.canvas = document.getElementById(canvasId);
    /** @type {CanvasRenderingContext2D} */
    this.ctx = this.canvas.getContext("2d");
    /** @type {Popup} */
    this.popup = new Popup();
    /** @type {Mode} */
    this.currentMode = VERTEX_MODE; // Default mode
    /** @type {Vertex|null} */
    this.firstVertex = null;
    /** @type {string} */
    this.currentDirection = "any"; // Default direction for edges

    // Set up control panel buttons
    document
      .getElementById("vertexModeBtn")
      .addEventListener("click", () => this.setMode(VERTEX_MODE));
    document
      .getElementById("edgeModeBtn")
      .addEventListener("click", () => this.setMode(EDGE_MODE));

    // Set up edge direction controls
    document.querySelectorAll('input[name="direction"]').forEach((radio) => {
      radio.addEventListener("change", (event) => {
        this.currentDirection = event.target.value;
        this.updateStatus(`Edge direction set to ${this.currentDirection}`);
      });
    });

    // Set up status display
    this.statusElement = document.getElementById("status");

    this.canvas.addEventListener("click", (event) => this.handleClick(event));
    this.updateStatus("Ready");
    this.graph.draw();
  }

  /**
   * Sets the current mode of the graph handler.
   * @param {number} mode - The mode to set.
   */
  setMode(mode) {
    this.currentMode = mode;
    if (mode === EDGE_MODE) {
      document.getElementById("edgeDirection").style.display = "block";
      this.updateStatus("Click on the first vertex to start creating an edge.");
    } else {
      document.getElementById("edgeDirection").style.display = "none";
      this.updateStatus("Ready");
      this.calculateAndDisplayCPP(); // Calculate CPP whenever switching back to vertex mode
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
      const label = prompt("Enter label for the vertex:", "New Vertex");
      if (label) {
        this.graph.addVertex(x, y, label);
        this.graph.draw();
      }
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
        this.graph.draw();
        this.setMode(VERTEX_MODE); // Switch back to vertex mode after creating an edge
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
   * @returns {Vertex|null} - The vertex if found, otherwise null.
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
   * Calculates and displays the Chinese Postman Problem results.
   */
  calculateAndDisplayCPP() {
    try {
      const result = this.graph.calculateChinesePostmanProblem();

      console.log(result);

      // Clear previous results
      const resultList = document.getElementById("cppResultList");
      if (resultList) {
        resultList.innerHTML = "";
      }

      if (result === "Graph not finished") {
        this.updateStatus("Graph not finished.");
        if (resultList) {
          const listItem = document.createElement("li");
          listItem.textContent = "Graph not finished.";
          resultList.appendChild(listItem);
        }
      } else {
        const path = result.path; // Assume the result contains the path and its cost
        const cost = result.cost;

        this.updateStatus(`CPP Path found with total cost: ${cost}`);

        if (resultList) {
          if (path.length === 0) {
            const listItem = document.createElement("li");
            listItem.textContent = "No valid path found.";
            resultList.appendChild(listItem);
          } else {
            path.forEach((edge) => {
              const listItem = document.createElement("li");
              listItem.textContent = `Travel from ${edge.vertex1.label} to ${edge.vertex2.label}`;
              resultList.appendChild(listItem);
            });
          }
        }
      }
    } catch (error) {
      console.error(error);
      this.updateStatus("Error calculating CPP.");
      const resultList = document.getElementById("cppResultList");
      if (resultList) {
        resultList.innerHTML = "<li>Error calculating CPP.</li>";
      }
    }
  }
}
