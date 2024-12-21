import { NetworkLink, NetworkNode, FCNN } from "./fcnn";
import * as d3 from "d3";


const CANVAS_DEFAULT_WIDTH = 800;
const CANVAS_DEFAULT_HEIGHT = 600;
const NODE_RADIUS_SCALE = 0.02; // Used to scale node size relative to canvas size

export class Renderer {
    private canvas: d3.Selection<SVGSVGElement, unknown, null, undefined>;

    constructor(canvas: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
        this.canvas = canvas;
    }

    render(fcnn: FCNN) {
        console.log("Rendering FCNN with architecture:", fcnn.layers);
        // Clear any existing SVG content
        this.canvas.selectAll("*").remove();

        const canvasContainer = this.canvas.node()?.getBoundingClientRect();
        const width = canvasContainer?.width || CANVAS_DEFAULT_WIDTH;
        const height = canvasContainer?.height || CANVAS_DEFAULT_HEIGHT;
        const nodeRadius = Math.min(width, height) * NODE_RADIUS_SCALE;

        // Create a map to store node positions
        const nodePositions = new Map<string, { x: number, y: number }>();

        // Calculate each node's position.
        const spaceBetweenLayers = width / (fcnn.layers.size + 1); // Evenly distribute layers across width with padding
        fcnn.layers.forEach((nodes, layerIdx) => {
            const spaceBetweenNodesInLayer = height / (nodes.length + 1);
            nodes.forEach((node, nodeIdx) => {
                nodePositions.set(node.id, {
                    x: (layerIdx + 1) * spaceBetweenLayers,
                    y: (nodeIdx + 1) * spaceBetweenNodesInLayer
                });
            });
        });

        // Draw connections first (so they appear behind nodes)
        this.canvas.selectAll(".link")
            .data(fcnn.links)
            .enter()
            .append("path")
            .attr("class", "link")
            .attr("d", (d: NetworkLink) => {
                const source = nodePositions.get(d.source)!;
                const target = nodePositions.get(d.target)!;
                const midX = (source.x + target.x) / 2;

                return `M ${source.x} ${source.y}
                C ${midX} ${source.y},
                  ${midX} ${target.y},
                  ${target.x} ${target.y}`;
            })
            .style("fill", "none")
            .style("stroke", "#000")
            .style("stroke-width", 2)
            .each(function (this: SVGPathElement) {
                const length = this.getTotalLength();
                d3.select(this)
                    .style("stroke-dasharray", `${length}`)
                    .style("stroke-dashoffset", `${length}`)
                    .transition()
                    .duration(2000)
                    .ease(d3.easeLinear)
                    .style("stroke-dashoffset", "0")
                    .transition()
                    .duration(2000)
                    .ease(d3.easeLinear)
                    .style("stroke-dashoffset", `-${length}`)
                    .on("end", function repeat(this: SVGPathElement) {
                        d3.select(this)
                            .style("stroke-dashoffset", `${length}`)
                            .transition()
                            .duration(2000)
                            .ease(d3.easeLinear)
                            .style("stroke-dashoffset", "0")
                            .transition()
                            .duration(2000)
                            .ease(d3.easeLinear)
                            .style("stroke-dashoffset", `-${length}`)
                            .on("end", repeat);
                    });
            });

        // Draw nodes
        const allNodes = Array.from(fcnn.layers.values()).flat();
        const nodes = this.canvas.selectAll(".node")
            .data(allNodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", (d: NetworkNode) => {
                const pos = nodePositions.get(d.id)!;
                return `translate(${pos.x},${pos.y})`;
            });

        nodes.append("circle")
            .attr("r", nodeRadius)
            .style("fill", "#fff")
            .style("stroke", "#333")
            .style("stroke-width", 2);
    }
}