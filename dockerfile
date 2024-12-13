FROM python:3.12-bullseye AS base

RUN apt update && apt install -y build-essential clang cmake python3-dev 

WORKDIR /hyperlight 

COPY . .

RUN pip install -r requirements.txt 

RUN cd hypergrad/build && rm -rf * && cmake .. -DPYTHON_EXECUTABLE=$(which python3) && make

CMD ["bash"]