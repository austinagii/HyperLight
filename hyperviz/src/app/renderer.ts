import { NetworkLink, NetworkNode, FCNN } from "./fcnn";
import * as d3 from "d3";


const CANVAS_DEFAULT_WIDTH = 800;
const CANVAS_DEFAULT_HEIGHT = 600;
const NODE_RADIUS_SCALE = 0.02; // Used to scale node size relative to canvas size
const ANIMATION_DURATION = 1000;
const ANIMATION_DELAY = 1000;


export class Renderer {
    private canvas: d3.Selection<SVGSVGElement, unknown, null, undefined>;

    constructor(canvas: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
        this.canvas = canvas;
    }

    render(fcnn: FCNN) {
        console.log("=== Rendering FCNN ===");
        console.log("FCNN structure:", {
            nodesByLayer: fcnn.nodesByLayer,
            linksByLayer: fcnn.linksByLayer,
            totalLayers: fcnn.linksByLayer.size
        });

        // Clear any scheduled animations
        for (let i = 0; i < 1000; i++) {
            window.clearTimeout(i);
        }
        // Clear any existing SVG content
        this.canvas.selectAll("path").remove();
        this.canvas.selectAll("*").remove();

        const canvasContainer = this.canvas.node()?.getBoundingClientRect();
        const width = canvasContainer?.width || CANVAS_DEFAULT_WIDTH;
        const height = canvasContainer?.height || CANVAS_DEFAULT_HEIGHT;
        console.log("Canvas dimensions:", { width, height });

        const nodeRadius = Math.min(width, height) * NODE_RADIUS_SCALE;

        // Create a map to store node positions
        const nodePositions = new Map<string, { x: number, y: number }>();

        // Calculate each node's position.
        console.log("Calculating node positions...");
        const spaceBetweenLayers = width / (fcnn.nodesByLayer.size + 1); // Evenly distribute layers across width with padding
        fcnn.nodesByLayer.forEach((nodes, layerIdx) => {
            const spaceBetweenNodesInLayer = height / (nodes.length + 1);
            nodes.forEach((node, nodeIdx) => {
                nodePositions.set(node.id, {
                    x: (layerIdx + 1) * spaceBetweenLayers,
                    y: (nodeIdx + 1) * spaceBetweenNodesInLayer
                });
            });
        });

        const animateLayer = (layerIndex: number) => {
            console.log(`=== Animating layer ${layerIndex} ===`);
            if (layerIndex >= fcnn.linksByLayer.size) {
                // Clear any existing animations by removing all paths
                this.canvas.selectAll("path").remove();
                setTimeout(() => {animateLayer(0)}, ANIMATION_DELAY);
                return;
            };

            const layerLinks = fcnn.linksByLayer.get(layerIndex) || [];
            console.log(`Layer ${layerIndex} has ${layerLinks.length} links`);

            const paths = this.canvas.selectAll(`.link-layer-${layerIndex}`)
                .data(layerLinks)
                .enter()
                .append("path");

            console.log(`Created ${paths.size()} path elements`);

            paths
                .attr("class", `link link-layer-${layerIndex}`)
                .attr("d", (d: NetworkLink) => {
                    const source = nodePositions.get(d.source)!;
                    const target = nodePositions.get(d.target)!;
                    const sourceControlX = source.x + (target.x - source.x) * 0.4;
                    const targetControlX = source.x + (target.x - source.x) * 0.6;
                    return `M ${source.x + nodeRadius} ${source.y} C ${sourceControlX} ${source.y}, ${targetControlX} ${target.y}, ${target.x - nodeRadius} ${target.y}`;
                })
                .style("fill", "none")
                .style("stroke", "#000")
                .style("stroke-width", 2);

            // After verifying paths are visible, we'll animate them
            paths.each(function () {
                const pathLength = this.getTotalLength();
                console.log("Path length:", pathLength);

                d3.select(this)
                    .attr("stroke-dasharray", pathLength)
                    .attr("stroke-dashoffset", pathLength)
                    .transition()
                    .duration(ANIMATION_DURATION)
                    .attr("stroke-dashoffset", 0);
            });
            setTimeout(() => animateLayer(layerIndex + 1), ANIMATION_DELAY);
        }

        animateLayer(0);

        // Draw nodes
        const allNodes = Array.from(fcnn.nodesByLayer.values()).flat();
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