from typing import List
import grpc
import numpy as np
import fcnn_pb2
import fcnn_pb2_grpc
from concurrent import futures

from hyperpy import FCNN


class FCNNServicer(fcnn_pb2_grpc.FCNNServicer):
    def createModel(self, request, context):
        print("Received request with layers:", request.layers)
        try:
            return create_fcnn(request.layers)
        except Exception as e:
            print("Error:", str(e))
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f'Error creating model: {str(e)}')
            return fcnn_pb2.FCNNModel()

def create_fcnn(architecture: List[int]):
    print("Creating FCNN with architecture:", architecture)
    architecture_array = np.array(architecture)
    print("Architecture array:", architecture_array)
    model = FCNN(architecture_array)
    weights = model.weights
    layer_weights = []
    for layer in weights:
        layer_weights.append(fcnn_pb2.FCNNModel.LayerWeights(weights=np.ravel(layer), shape=layer.shape))
    return fcnn_pb2.FCNNModel(layer_weights=layer_weights)

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    fcnn_pb2_grpc.add_FCNNServicer_to_server(FCNNServicer(), server)
    server.add_insecure_port('[::]:8090')
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    serve()