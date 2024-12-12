#include <xtensor/xarray.hpp>
#include <xtensor/xio.hpp>

namespace hyper {
  class FCNN {
    public:
      template <typename T> T forward(const xt::xarray<T>& input) {
        return xt::sum(input)();
      }
  };
}
