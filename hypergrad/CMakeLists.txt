cmake_minimum_required(VERSION 3.14)
project(hypergrad)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

include(FetchContent)

# Fetch xtl
FetchContent_Declare(
  xtl
  GIT_REPOSITORY https://github.com/xtensor-stack/xtl.git 
  GIT_TAG        0.7.7
)
FetchContent_MakeAvailable(xtl)

# Fetch xtensor
FetchContent_Declare(
  xtensor
  GIT_REPOSITORY https://github.com/xtensor-stack/xtensor.git
  GIT_TAG        0.25.0
)
FetchContent_MakeAvailable(xtensor)

# Fetch pybind11
FetchContent_Declare(
  pybind11
  GIT_REPOSITORY https://github.com/pybind/pybind11.git
  GIT_TAG        v2.13.6
)
FetchContent_MakeAvailable(pybind11)

set(SOURCES
  src/main.cpp
  src/bindings.cpp
)

set(HEADERS 
  include/fcnn.hpp
)

pybind11_add_module(hyperpy ${SOURCES} ${HEADERS})

target_include_directories(hyperpy 
  PRIVATE 
    ${xtensor_SOURCE_DIR}/include 
    ${xtl_SOURCE_DIR}/include
    ${CMAKE_SOURCE_DIR}/include
    ${pybind11_SOURCE_DIR}/include
)