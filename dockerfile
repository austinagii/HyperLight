FROM python:3.12-bullseye AS base

RUN apt update && apt install -y build-essential clang cmake python3-dev 

RUN apt remove -y python3.9 && apt autoremove -y 

WORKDIR /hyperlight 

COPY . .

RUN pip install -r requirements.txt 

RUN cd hypergrad/build && rm -rf * && cmake .. -DPYTHON_EXECUTABLE=$(which python3) && make VERBOSE=1

CMD ["bash"]