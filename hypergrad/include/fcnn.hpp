#include <xtensor/xarray.hpp>
#include <xtensor/xio.hpp>

namespace hyper {
  class FCNN {
    public:
      FCNN() = default;
      ~FCNN() = default;

      template <typename T>
      T forward(xt::xarray<T> input) {
        return xt::sum(input)();
      }
  };
}
