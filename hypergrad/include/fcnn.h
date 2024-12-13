#ifndef FCNN_H
#define FCNN_H

#include <xtensor/xarray.hpp>
#include <xtensor/xio.hpp>

namespace hyper {
  class FCNN {
    public:
      FCNN() = default;
      ~FCNN() = default;

      double forward(const xt::xarray<double>& input) {
        return xt::sum(input)();
      }
  };
}

#endif // FCNN_H