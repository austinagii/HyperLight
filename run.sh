#!/usr/bin/env bash

# TODO: Refactor hardcoded version number.
docker image build -t hyperlight:0.0.1 .
if [ $? -ne 0 ]; then
  echo "Failed to build build agent" 
  exit 1
fi

# TODO: Handle tag failure.
docker tag hyperlight:0.0.1 hyperlight:latest 

docker container run -it --rm hyperlight:latest
if [ $? -ne 0 ]; then
  echo "Failed to build hyperlight binary" 
  exit 1
fi
