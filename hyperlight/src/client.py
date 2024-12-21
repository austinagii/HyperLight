import grpc
import fcnn_pb2
import fcnn_pb2_grpc

def run():
    channel = grpc.insecure_channel('localhost:8090')
    stub = fcnn_pb2_grpc.FCNNStub(channel)
    response = stub.createModel(fcnn_pb2.NetworkArchitecture(layers=[5, 10, 10, 1]))
    print(response)

if __name__ == '__main__':
    run()