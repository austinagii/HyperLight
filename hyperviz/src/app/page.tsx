'use client';
import { useEffect } from "react";
import * as d3 from "d3";

/**
 * Represents a node in a neural network
 * @interface Node
 */
interface Node {
  /** Unique identifier for the node */
  id: string;
  /** The layer number this node belongs to (0 = input, increasing numbers for hidden layers, last number for output) */
  layer: number;
  /** Position index of this node within its layer (0-based) */
  index: number;
}

/**
 * Represents a connection between two nodes in a neural network
 * @interface Link
 */
interface Link {
  /** ID of the source/origin node */
  source: string;
  /** ID of the target/destination node */
  target: string;
}

/**
 * Represents a fully connected neural network
 * @class FCNN
 */
class FCNN {
  // The nodes of the network indexed by layer
  layers: Map<number, Node[]>;  
  // The connections between the nodes in the network
  links: Link[]; 

  constructor() {
    // Define a hardcoded FCNN structure
    this.layers = new Map<number, Node[]>([
      [0, [ // Input layer
        { id: 'input_0', layer: 0, index: 0 },
        { id: 'input_1', layer: 0, index: 1 }, 
        { id: 'input_2', layer: 0, index: 2 },
        { id: 'input_3', layer: 0, index: 3 },
        { id: 'input_4', layer: 0, index: 4 }
      ]],
      [1, [ // Output layer
        { id: 'output_0', layer: 2, index: 0 },
      ]]
    ]);

    // Generate links between layers
    this.links = [];
    for (let i = 0; i < this.layers.size - 1; i++) {
      const layer = this.layers.get(i)!;
      const nextLayer = this.layers.get(i + 1)!;

      for (let currentNode of layer.values()) {
        for (let connectedNode of nextLayer.values()) {
          this.links.push({
            source: currentNode.id,
            target: connectedNode.id
          });
        }
      }
    }
  }
}

// Create a single instance to use throughout the app
export const fcnn = new FCNN();

// Main component
export default function Home() {
  useEffect(() => {
    // Clear any existing SVG content
    d3.select("#network-svg").selectAll("*").remove();

    const svg = d3.select("#network-svg");
    const svgContainer = svg.node()?.getBoundingClientRect();
    const width = svgContainer?.width || 800;
    const height = svgContainer?.height || 800;
    const nodeRadius = Math.min(width, height) * 0.02; // Scale node size relative to container
    const spaceBetweenLayers = width / (fcnn.layers.size + 1); // Evenly distribute layers across width with padding

    // Create a map to store node positions
    const nodePositions = new Map<string, {x: number, y: number}>();

    // Position nodes
    fcnn.layers.forEach((nodes, layer) => {
      const spaceBetweenNodesInLayer = height / (nodes.length + 1);
      
      nodes.forEach((node, index) => {
        nodePositions.set(node.id, {
          x: (layer + 1) * spaceBetweenLayers,
          y: (index + 1) * spaceBetweenNodesInLayer
        });
      });
    });

    // Draw connections first (so they appear behind nodes)
    svg.selectAll(".link")
      .data(fcnn.links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", (d: Link) => {
        const source = nodePositions.get(d.source)!;
        const target = nodePositions.get(d.target)!;
        const midX = (source.x + target.x) / 2;
        
        return `M ${source.x} ${source.y}
                C ${midX} ${source.y},
                  ${midX} ${target.y},
                  ${target.x} ${target.y}`;
      })
      .style("fill", "none")
      .style("stroke", "#aaa")
      .style("stroke-width", 1.5);

    // Draw nodes
    const allNodes = Array.from(fcnn.layers.values()).flat();
    const nodes = svg.selectAll(".node")
      .data(allNodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: Node) => {
        const pos = nodePositions.get(d.id)!;
        return `translate(${pos.x},${pos.y})`;
      });

    nodes.append("circle")
      .attr("r", nodeRadius)
      .style("fill", "#fff")
      .style("stroke", "#333")
      .style("stroke-width", 2);

  }, []);
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full h-full">
        <svg id="network-svg" className="w-full h-full"></svg>
      </main>
    </div>
  );
}
