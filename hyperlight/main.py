from hyperpy import FCNN
import numpy as np

model = FCNN()
output = model.forward(np.array([[1, 2, 3], [4, 5, 6]]))
print(output)