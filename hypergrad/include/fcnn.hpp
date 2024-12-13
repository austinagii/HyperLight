#include <xtensor/xarray.hpp>
#include <xtensor/xio.hpp>

namespace hyper {
  class FCNN {
    public:
      FCNN() = default;
      ~FCNN() = default;

      int forward() {
        return xt::sum(xt::xarray<int>{1, 2, 3})();
      }
  };
}
