import { NetworkLink, NetworkNode, FCNN } from "./fcnn";
import * as d3 from "d3";


const CANVAS_DEFAULT_WIDTH = 800;
const CANVAS_DEFAULT_HEIGHT = 600;
const NODE_RADIUS_SCALE = 0.02; // Used to scale node size relative to canvas size
const ANIMATION_DURATION = 1000;
const ANIMATION_DELAY = 1000;

/**
 * A simple 2D point with x and y coordinates.
 */
interface Point {
    x: number;
    y: number;
}

/**
 * Renderer is responsible for drawing the FCNN on the canvas.
 */
export class Renderer {
    private canvas: d3.Selection<SVGSVGElement, unknown, null, undefined>;

    constructor(canvas: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
        this.canvas = canvas;
    }

    /**
     * Render the specified FCNN on the canvas associated with this renderer.
     *
     * @param fcnn - The FCNN to render
     */
    render(fcnn: FCNN) {
        // Clear any scheduled animations
        // for (let i = 0; i < 100000; i++) {
        //     window.clearTimeout(i);
        // }
        this.canvas.selectAll("*").remove();

        const canvasContainer = this.canvas.node()?.getBoundingClientRect();
        const canvasWidth = canvasContainer?.width || CANVAS_DEFAULT_WIDTH;
        const canvasHeight = canvasContainer?.height || CANVAS_DEFAULT_HEIGHT;
        console.log("Rendering FCNN on canvas with dimensions:", { width: canvasWidth, height: canvasHeight });

        var nodePositionsById = this.calculateNodePositions(fcnn.nodesByLayer, canvasWidth, canvasHeight);
        const nodeRadius = Math.min(canvasWidth, canvasHeight) * NODE_RADIUS_SCALE;
        const allNodes = Array.from(fcnn.nodesByLayer.values()).flat();
        this.drawNodes(allNodes, nodePositionsById, nodeRadius);

        const animateLayer = (layerIndex: number) => {
            console.log(`=== Animating layer ${layerIndex} ===`);
            if (layerIndex >= fcnn.linksByLayer.size) {
                // Clear any existing animations by removing all paths
                this.canvas.selectAll("path").remove();
                setTimeout(() => { animateLayer(0) }, ANIMATION_DELAY);
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
                    const source = nodePositionsById.get(d.source)!;
                    const target = nodePositionsById.get(d.target)!;
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
    }

    private calculateNodePositions(
        nodesByLayer: Map<number, NetworkNode[]>,
        canvasWidth: number,
        canvasHeight: number):
        Map<string, { x: number, y: number }> {

        console.log("Calculating node positions...");
        const nodePositionsById = new Map<string, { x: number, y: number }>();
        // Calculate the space required to evenly distrbute layers horizontally across the canvas, 
        // adding 1 to create padding on both sides.
        const spaceBetweenLayers = canvasWidth / (nodesByLayer.size + 1);
        nodesByLayer.forEach((layerNodes, layerIdx) => {
            // Calculate the space required to evenly distrbute nodes vertically within each layer, 
            // adding 1 to create padding on both sides.
            const spaceBetweenNodesInLayer = canvasHeight / (layerNodes.length + 1);
            layerNodes.forEach((node, nodeIdx) => {
                nodePositionsById.set(node.id, {
                    // Calculate x,y coordinates with offsets to center nodes within each layer and 
                    // prevent edge clipping
                    x: (layerIdx + 1) * spaceBetweenLayers,
                    y: (nodeIdx + 1) * spaceBetweenNodesInLayer
                });
            });
        });
        return nodePositionsById;
    }

    private drawNodes(nodes: NetworkNode[], nodePositionsById: Map<string, Point>, nodeRadius: number) {
        this.canvas.selectAll(".node")
            .data(nodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", (d: NetworkNode) => {
                const pos = nodePositionsById.get(d.id)!;
                return `translate(${pos.x},${pos.y})`;
            })
            .append("circle")
            .attr("r", nodeRadius)
            .style("fill", "#fff")
            .style("stroke", "#333")
            .style("stroke-width", 2);

    }
}