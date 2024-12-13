#include <pybind11/pybind11.h>
#include <pybind11/numpy.h>
#include <xtensor-python/pyarray.hpp>
#include "fcnn.hpp"

namespace py = pybind11;

PYBIND11_MODULE(hyperpy, m) {
    m.doc() = "The hyper module";

    xt::import_numpy();

    py::class_<hyper::FCNN>(m, "FCNN")
        .def(py::init<>())
        .def("forward", [](hyper::FCNN& self, const xt::pyarray<double>& input) {
            return self.forward<double>(input);
        }, py::arg("input"));
}
