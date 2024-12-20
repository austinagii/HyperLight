from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class NetworkArchitecture(_message.Message):
    __slots__ = ("layers",)
    LAYERS_FIELD_NUMBER: _ClassVar[int]
    layers: _containers.RepeatedScalarFieldContainer[int]
    def __init__(self, layers: _Optional[_Iterable[int]] = ...) -> None: ...

class FCNNModel(_message.Message):
    __slots__ = ("layer_weights",)
    class LayerWeights(_message.Message):
        __slots__ = ("weights", "shape")
        WEIGHTS_FIELD_NUMBER: _ClassVar[int]
        SHAPE_FIELD_NUMBER: _ClassVar[int]
        weights: _containers.RepeatedScalarFieldContainer[float]
        shape: _containers.RepeatedScalarFieldContainer[int]
        def __init__(self, weights: _Optional[_Iterable[float]] = ..., shape: _Optional[_Iterable[int]] = ...) -> None: ...
    LAYER_WEIGHTS_FIELD_NUMBER: _ClassVar[int]
    layer_weights: _containers.RepeatedCompositeFieldContainer[FCNNModel.LayerWeights]
    def __init__(self, layer_weights: _Optional[_Iterable[_Union[FCNNModel.LayerWeights, _Mapping]]] = ...) -> None: ...
