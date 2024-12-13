#include <gtest/gtest.h>
#include "fcnn.h"

TEST(FCNN, Forward) {
    hyper::FCNN model;
    xt::xarray<double> input = {{1, 2, 3}, {4, 5, 6}};
    EXPECT_EQ(model.forward(input), 21);
}
