import { NetworkLink, NetworkNode, FCNN } from "@/lib/fcnn";
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
 * The dimensions (width and height) of a 2D element.
 */
interface Dimensions {
    width: number;
    height: number;
}

/**
 * Renderer is responsible for drawing the FCNN on the canvas.
 */
export class Renderer {
    private canvas: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private canvasDimensions: Dimensions;
    private fcnn: FCNN;

    constructor(canvas: d3.Selection<SVGSVGElement, unknown, null, undefined>, fcnn: FCNN) {
        this.canvas = canvas;
        this.fcnn = fcnn;
        this.canvasDimensions = this.getCanvasDimensions();
    }

    /**
     * Calculate the positions of all nodes in the FCNN.
     * 
     * @returns A map of node IDs to their positions.
     */
    private calculateNodePositions(): Map<string, Point> {
        console.log("Calculating node positions...");
        console.log("Canvas dimensions:", this.canvasDimensions);
        const nodePositionsById = new Map<string, { x: number, y: number }>();
        // Calculate the space required to evenly distrbute layers horizontally across the canvas, 
        // adding 1 to create padding on both sides.
        const spaceBetweenLayers = this.canvasDimensions.width / (this.fcnn.nodesByLayer.size + 1);
        this.fcnn.nodesByLayer.forEach((layerNodes, layerIdx) => {
            // Calculate the space required to evenly distrbute nodes vertically within each layer, 
            // adding 1 to create padding on both sides.
            const spaceBetweenNodesInLayer = this.canvasDimensions.height / (layerNodes.length + 1);
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

    private drawNodes(nodePositionsById: Map<string, Point>) {
        const allNodes = Array.from(this.fcnn.nodesByLayer.values()).flat();
        const nodeRadius = Math.min(this.canvasDimensions.width, this.canvasDimensions.height) * NODE_RADIUS_SCALE;

        this.canvas.selectAll(".node")
            .data(allNodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", (d: NetworkNode) => {
                const pos = nodePositionsById.get(d.id)!;
                return `translate(${pos.x},${pos.y})`;
            })
            .append("circle")
            // TODO: Use a configuration object for node styling.
            .attr("r", nodeRadius)
            .style("fill", "#fff")
            .style("stroke", "#333")
            .style("stroke-width", 2);
    }

    private drawLinks(nodePositionsById: Map<string, Point>) {
        // TODO: This is a duplicate of the node radius calculation from drawNodes. 
        //       This should be refactored to use a configuration object.
        const nodeRadius = Math.min(this.canvasDimensions.width, this.canvasDimensions.height) * NODE_RADIUS_SCALE;

        this.fcnn.linksByLayer.forEach((layerLinks, layerIndex) => {
            this.canvas.selectAll(`.link-layer-${layerIndex}`)
                .data(layerLinks)
                .enter()
                .append("path")
                .attr("class", `link link-layer-${layerIndex}`)
                .attr("d", (d: NetworkLink) => {
                    const source = nodePositionsById.get(d.source)!;
                    const target = nodePositionsById.get(d.target)!;
                    const sourceControlX = source.x + (target.x - source.x) * 0.4;
                    const targetControlX = source.x + (target.x - source.x) * 0.6;
                    // Position the link endpoints at the vertical center of each node, but offset them 
                    // horizontally by the node radius to connect at the node edges rather than centers.
                    // This prevents the link from overlapping with the node circles.
                    return `M ${source.x + nodeRadius} ${source.y} 
                            C ${sourceControlX} ${source.y}, ${targetControlX} ${target.y}, 
                              ${target.x - nodeRadius} ${target.y}`;
                })
                // TODO: Use a configuration object for link styling.
                .style("fill", "none")
                .style("stroke", "#000")
                .style("stroke-width", 2);
        });
    }

    /**
     * Animate the links in the FCNN.
     */
    public animateLinks() {
        // Reset all links to their original state.
        this.canvas.selectAll('.link').each(function () {
            const pathLength = this.getTotalLength();
            d3.select(this)
                .attr("stroke-dasharray", pathLength)
                .attr("stroke-dashoffset", pathLength);
        });

        for (let layerIndex = 0; layerIndex < this.fcnn.linksByLayer.size; layerIndex++) {
            setTimeout(() => {
                console.log(`=== Animating layer ${layerIndex} ===`);
                this.canvas.selectAll(`.link-layer-${layerIndex}`).each(function () {
                    const pathLength = this.getTotalLength();
                    console.log("Path length:", pathLength);

                    d3.select(this)
                        .attr("stroke-dasharray", pathLength)
                        .attr("stroke-dashoffset", pathLength)
                        .transition()
                        .duration(ANIMATION_DURATION)
                        .attr("stroke-dashoffset", 0);
                });
            }, ANIMATION_DELAY * layerIndex);
        }
    }

    /**
     * Render the specified FCNN on the canvas associated with this renderer.
     *
     * @param fcnn - The FCNN to render
     */
    render() {
        this.resetCanvas();

        var nodePositionsById = this.calculateNodePositions();
        this.drawNodes(nodePositionsById);
        this.drawLinks(nodePositionsById);
    }

    /**
     * Reset the canvas by removing all elements.
     */
    private resetCanvas() {
        this.canvas.selectAll("*").remove();
    }

    /**
     * Get the dimensions (width and height) of the canvas.
     * 
     * @returns The dimensions of the canvas.
     */
    private getCanvasDimensions() {
        const canvasContainer = this.canvas.node()?.getBoundingClientRect();
        const canvasWidth = canvasContainer?.width || CANVAS_DEFAULT_WIDTH;
        const canvasHeight = canvasContainer?.height || CANVAS_DEFAULT_HEIGHT;
        return { width: canvasWidth, height: canvasHeight };
    }
}
