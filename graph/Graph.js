import { Vertex } from "./Vertex.js";
import { Edge } from "./Edge.js";

export class Graph {
  constructor(canvasId) {
    this.vertices = [];
    this.edges = [];
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
  }

  addVertex(x, y, label) {
    const vertex = new Vertex(x, y, label);
    this.vertices.push(vertex);
    return vertex;
  }

  addEdge(vertex1, vertex2, direction = "any") {
    const edge = new Edge(vertex1, vertex2, direction);
    this.edges.push(edge);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.edges.forEach((edge) => edge.draw(this.ctx));
    this.vertices.forEach((vertex) => vertex.draw(this.ctx));
  }
}
