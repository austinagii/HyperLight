#!/usr/bin/env bash

# TODO: Refactor hardcoded version number.
docker image build -t hyperlight-dev:0.0.1 .
if [ $? -ne 0 ]; then
  echo "Failed to build image" 
  exit 1
fi

docker container run -it --rm hyperlight-dev:0.0.1 python -m pytest tests 
if [ $? -ne 0 ]; then
  echo "Failed to build hyperlight binary" 
  exit 1
fi
