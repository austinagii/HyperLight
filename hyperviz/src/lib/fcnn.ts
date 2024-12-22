const { FCNNModel, NetworkArchitecture } = require("@/api/fcnn_pb");
const { FCNNClient } = require("@/api/fcnn_grpc_web_pb");

/**
 * Represents a node in a neural network
 * @interface NetworkNode
 */
interface NetworkNode {
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
interface NetworkLink {
    /** ID of the source/origin node */
    source: string;
    /** ID of the target/destination node */
    target: string;
}

function createFcnnModel(architecture: typeof NetworkArchitecture) {
    console.log("Creating FCNN model");
    var client = new FCNNClient('http://localhost:8080', null, null);
    client.createModel(architecture, {}, function (err: any, response: any) {
        if (err) {
            console.error('Error:', err);
            return;
        }
        console.log(response.toObject());
    });
}

/**
 * Represents a fully connected neural network
 * @class FCNN
 */
class FCNN {
    model: typeof FCNNModel;
    // The nodes of the network indexed by layer
    nodesByLayer: Map<number, NetworkNode[]>;
    // All the outgoing links for each layer.
    linksByLayer: Map<number, NetworkLink[]>;
    totalLayers: number;

    constructor(layerArchitecture: number[]) {
        this.createModel(layerArchitecture);
        this.nodesByLayer = new Map<number, NetworkNode[]>();
        this.linksByLayer = new Map<number, NetworkLink[]>();
        this.totalLayers = layerArchitecture.length;

        for (let layerIdx = 0; layerIdx < layerArchitecture.length; layerIdx++) {
            this.nodesByLayer.set(layerIdx, []);
            this.linksByLayer.set(layerIdx, []);

            const layerName = this.getLayerName(layerIdx);
            for (let nodeIdx = 0; nodeIdx < layerArchitecture[layerIdx]; nodeIdx++) {
                console.log(`Creating node ${layerName}_${nodeIdx} in layer ${layerIdx}`);
                this.nodesByLayer.get(layerIdx)!.push({
                    id: `${layerName}_${nodeIdx}`,
                    layer: layerIdx,
                    index: nodeIdx
                });

                if (layerIdx > 0) {
                    const previousLayer = this.nodesByLayer.get(layerIdx - 1)!;
                    for (let previousNode of previousLayer.values()) {
                        console.log(`Creating link from ${previousNode.id} to ${this.nodesByLayer.get(layerIdx)![nodeIdx].id}`);
                        this.linksByLayer.get(layerIdx - 1)!.push({
                            source: previousNode.id,
                            target: this.nodesByLayer.get(layerIdx)![nodeIdx].id
                        });
                    }
                }
            }
        }
    }

    private createModel(layerArchitecture: number[]) {
        var modelArchitecture = new NetworkArchitecture();
        modelArchitecture.setLayersList(layerArchitecture);
        createFcnnModel(modelArchitecture);
    }

    private getLayerName(layerIdx: number): string {
        if (layerIdx === 0) {
            return "input";
        } else if (layerIdx === this.totalLayers - 1) {
            return "output";
        } else {
            return `hidden${layerIdx-1}`;
        }
    }
}

export type { NetworkLink, NetworkNode };
export { FCNN };