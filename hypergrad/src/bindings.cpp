#include <pybind11/pybind11.h>
#define FORCE_IMPORT_ARRAY
#include <xtensor-python/pyarray.hpp>
#include "fcnn.h"

namespace py = pybind11;

PYBIND11_MODULE(hyperpy, m) {
    xt::import_numpy();
    m.doc() = "The hyper module";

    py::class_<hyper::FCNN>(m, "FCNN")
        .def(py::init<>())
        .def("forward", [](hyper::FCNN& self, const xt::pyarray<double>& input) {
            return self.forward(input);
        }, py::arg("input"));
}