#ifndef FCNN_H
#define FCNN_H

#include <memory>
#include <xtensor/xarray.hpp>
#include <xtensor/xio.hpp>
#include <xtensor/xrandom.hpp>

namespace hyper {
  class FCNN {
    public:
      FCNN(const xt::xarray<std::size_t>& neuronsPerLayer) {
        const auto numLayers = neuronsPerLayer.size();
        weights = std::make_unique<std::vector<xt::xarray<double>>>();
        weights->reserve(numLayers - 1);

        for (size_t i = 1; i < numLayers; ++i) {
            const auto neuronsInCurrentLayer = neuronsPerLayer[i];
            const auto neuronsInPreviousLayer = neuronsPerLayer[i-1];
            std::vector<std::size_t> shape = {neuronsInCurrentLayer, neuronsInPreviousLayer};
            this->weights->push_back(xt::random::rand<double>(shape, 0, 1));
        }
      }
      ~FCNN() = default;

      double forward(const xt::xarray<double>& input) {
        return xt::sum(input)();
      }

      std::vector<xt::xarray<double>> getWeights() {
        return *weights;
      }

    private:
      std::unique_ptr<std::vector<xt::xarray<double>>> weights;
  };
}

// auto network = hyper::FCNN([5, 10, 10, 1]);

#endif // FCNN_H