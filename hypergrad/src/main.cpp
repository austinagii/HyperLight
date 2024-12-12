#include <cstdint>
#include <iostream>
#include <xtensor/xarray.hpp>
#include <xtensor/xio.hpp>

#include <fcnn.hpp>

int main() {
    auto model = hyper::FCNN();
    xt::xarray<double> input = {1.0, 2.0, 3.0, 4.0};
    std::cout << "Output: " << model.forward(input) << std::endl;
    return 0;
}