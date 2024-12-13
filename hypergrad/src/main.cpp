#include <cstdint>
#include <iostream>
#include <xtensor/xarray.hpp>
#include <xtensor/xio.hpp>

#include <fcnn.hpp>

int main() {
    auto model = hyper::FCNN();
    std::cout << "Output: " << model.forward() << std::endl;
    return 0;
}