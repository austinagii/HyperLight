#include <pybind11/pybind11.h>
#include <pybind11/numpy.h>
#include "fcnn.hpp"

namespace py = pybind11;

PYBIND11_MODULE(hyperpy, m) {
    m.doc() = "The hyper module";

    py::class_<hyper::FCNN>(m, "FCNN")
        .def(py::init<>())
        .def("forward", &hyper::FCNN::forward);
}