import pytest
import numpy as np

from genesis import NeuralNetwork


class TestNeuralNetwork():
    def test_initialization_succeeds_with_valid_args(self):
        """Test initializing the neural network with valid n_features_in and neurons"""
        nn = NeuralNetwork(n_features_in=3, neurons=[1, 2, 3])
        assert isinstance(nn, NeuralNetwork)

    def test_raises_type_error_for_non_integer_n_features_in(self):
        """Test raising TypeError when n_features_in is not an integer"""
        with pytest.raises(TypeError):
            NeuralNetwork('a', [1, 2, 3])

        with pytest.raises(TypeError):
            NeuralNetwork({1}, [1, 2, 3])

        with pytest.raises(TypeError):
            NeuralNetwork(None, [1, 2, 3])

    def test_raises_value_error_for_non_positive_n_features_in(self):
        """Test raising ValueError when n_features_in is less than or equal to zero"""
        with pytest.raises(ValueError):
            NeuralNetwork(n_features_in=-1, neurons=[5, 3, 1])

        with pytest.raises(ValueError):
            NeuralNetwork(n_features_in=0, neurons=[5, 3, 1])

    def test_raises_type_error_for_invalid_neurons_sequence(self):
        """Test raising TypeError when neurons is not a valid sequence of integers"""
        with pytest.raises(TypeError):
            NeuralNetwork(n_features_in=3, neurons=None)

        with pytest.raises(TypeError):
            NeuralNetwork(n_features_in=3, neurons="5,3,1")

        with pytest.raises(TypeError):
            NeuralNetwork(n_features_in=3, neurons=[5, "three", 1])
    
    def test_raises_value_error_for_invalid_neuron_values(self):
        """Test raising ValueError when neurons contains zero or negative values"""
        with pytest.raises(ValueError):
            NeuralNetwork(n_features_in=3, neurons=[])

        with pytest.raises(ValueError):
            NeuralNetwork(n_features_in=3, neurons=[5, 0, 1])

        with pytest.raises(ValueError):
            NeuralNetwork(n_features_in=3, neurons=[5, -3, 1])

    def test_model_weights_are_initialized(self):
        """Test neural network weights are initialized correctly based on input size and neurons per layer"""
        nn = NeuralNetwork(3, [3, 2, 1])

        assert len(nn.weights) == 3

        assert nn.weights[0].shape == (3, 3)
        assert nn.weights[1].shape == (3, 2)
        assert nn.weights[2].shape == (2, 1)

    def test_forward_pass_accurately_calculates_output(self):
        nn = NeuralNetwork(3, [3, 2, 1])
        weights = nn.weights
        inputs = np.array([3, 8, 5], np.float32)

        output1 = np.matmul(inputs, weights[0])
        output2 = np.matmul(output1, weights[1])
        output3 = np.matmul(output2, weights[2])

        outputs = nn(inputs)
        assert outputs == output3
