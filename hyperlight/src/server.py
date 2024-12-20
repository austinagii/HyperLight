from typing import List
import grpc
import numpy as np
import fcnn_pb2
import fcnn_pb2_grpc
from concurrent import futures

from hyperpy import FCNN


class FCNNServicer(fcnn_pb2_grpc.FCNNServicer):
    def createModel(self, request, context):
        return create_fcnn(request.layers)

def create_fcnn(architecture: List[int]):
    architecture_array = np.array(architecture)
    model = FCNN(architecture_array)
    weights = model.weights
    layer_weights = []
    for layer in weights:
        layer_weights.append(fcnn_pb2.FCNNModel.LayerWeights(weights=np.ravel(layer), shape=layer.shape))
    return fcnn_pb2.FCNNModel(layer_weights=layer_weights)

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    fcnn_pb2_grpc.add_FCNNServicer_to_server(FCNNServicer(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    serve()