const { FCNNModel, NetworkArchitecture } = require("./fcnn_pb");
const { FCNNClient } = require("./fcnn_grpc_web_pb");

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
  client.createModel(architecture, {}, function(err: any, response: any) {
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
  layers: Map<number, NetworkNode[]>;  
  // The connections between the nodes in the network
  links: NetworkLink[]; 

  constructor(layerArchitecture: number[]) {
    var modelArchitecture = new NetworkArchitecture();
    modelArchitecture.setLayersList(layerArchitecture);
    createFcnnModel(modelArchitecture);

    var inputLayerIdx = 0;
    var outputLayerIdx = layerArchitecture.length - 1;
    this.layers = new Map<number, NetworkNode[]>();
    // Generate the specified layers and nodes.
    layerArchitecture.forEach((nodesInLayer, layerIdx) => {
        var layerName = "";
        switch (layerIdx) {
            case inputLayerIdx:
                layerName = "input";
                break;
            case outputLayerIdx:
                layerName = "output";
                break;
            default:
                layerName = `hidden_${layerIdx}`;
                break;
        }

        // Add the specified number of nodes to the layer.
        var layer = [];
        for (let nodeIdx = 0; nodeIdx < nodesInLayer; nodeIdx++) {
            layer.push({
                id: `${layerName}_${nodeIdx}`,
                layer: layerIdx,
                index: nodeIdx
            });
        }
        this.layers.set(layerIdx, layer);
    });

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

export type { NetworkLink, NetworkNode };
export { FCNN };